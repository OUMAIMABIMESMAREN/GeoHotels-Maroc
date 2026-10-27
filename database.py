from py2neo import Graph, Node
import requests

def get_connection():
    return Graph("bolt://localhost:7687", auth=("neo4j", "12345678"))

def get_all_hotels():
    graph = get_connection()
    result = graph.run("""
        MATCH (h:Hotel)
        RETURN h.name AS nom, 
               h.latitude AS lat, 
               h.longitude AS lon,
               h.stars AS stars,
               h.phone AS phone,
               h.email AS email,
               h.website AS website
    """).data()
    return result

def importer_hotels_ville(lat, lon, rayon_km=10):
    graph = get_connection()
    
    delta = rayon_km / 111.0
    min_lat = lat - delta
    max_lat = lat + delta
    min_lon = lon - delta
    max_lon = lon + delta
    
    print(f"Téléchargement des hôtels autour de {lat},{lon}...")
    
    query = f'[out:json][timeout:25];node["tourism"="hotel"]({min_lat},{min_lon},{max_lat},{max_lon});out body;'
    url = f"https://overpass-api.de/api/interpreter?data={requests.utils.quote(query)}"
    headers = {"User-Agent": "ProjetGeo/1.0 (etudiant@email.com)"}
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            print(f"Erreur OpenStreetMap: {response.status_code}")
            return 0
        
        data = response.json()
        hotels = data.get('elements', [])
        
        print(f"{len(hotels)} hôtels trouvés sur OpenStreetMap")
        
        graph.run("MATCH (h:Hotel) DETACH DELETE h")
        print("Anciens hôtels supprimés ✅")
        
        for hotel in hotels:
            tags = hotel.get('tags', {})
            nom     = tags.get('name', 'Sans nom')
            stars   = tags.get('stars', tags.get('star_rating', ''))
            phone   = tags.get('phone', tags.get('contact:phone', ''))
            email   = tags.get('email', tags.get('contact:email', ''))
            website = tags.get('website', tags.get('contact:website', ''))

            node = Node("Hotel",
                        name=nom,
                        latitude=float(hotel['lat']),
                        longitude=float(hotel['lon']),
                        stars=stars,
                        phone=phone,
                        email=email,
                        website=website)
            graph.create(node)
        
        print(f"{len(hotels)} hôtels importés ✅")
        return len(hotels)
        
    except Exception as e:
        print(f"Erreur: {e}")
        return 0