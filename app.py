from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_all_hotels, importer_hotels_ville
from geo import distance_km

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/hotels', methods=['GET'])
def hotels():
    data = get_all_hotels()
    return jsonify(data)

@app.route('/api/charger-ville', methods=['POST'])
def charger_ville():
    body = request.get_json()
    lat = body.get('lat')
    lon = body.get('lon')
    nb = importer_hotels_ville(lat, lon, rayon_km=10)
    return jsonify({'message': f'{nb} hotels charges !', 'total': nb})

@app.route('/api/recherche', methods=['POST'])
def recherche():
    body = request.get_json()
    ma_lat = body.get('lat', 33.5731)
    ma_lon = body.get('lon', -7.5898)
    rayon = body.get('rayon', 3.0)
    hotels = get_all_hotels()
    resultats = []
    for h in hotels:
        dist = distance_km(ma_lat, ma_lon, h['lat'], h['lon'])
        if dist <= rayon:
            resultats.append({
                'nom': h['nom'],
                'lat': h['lat'],
                'lon': h['lon'],
                'distance': dist
            })
    resultats.sort(key=lambda x: x['distance'])
    return jsonify(resultats)

if __name__ == '__main__':
    app.run(debug=True, port=5000)