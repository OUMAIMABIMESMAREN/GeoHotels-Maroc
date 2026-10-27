const adressesVilles = {
    "Casablanca": ["Centre-ville", "Derb Sultan", "Maarif", "Anfa", "Ain Diab", "Hay Mohammadi", "Sidi Belyout", "Bourgogne", "Gauthier", "Twin Center"],
    "Rabat": ["Agdal", "Hassan", "Ocean", "Youssoufia", "Hay Riad", "Souissi", "Medina", "Akkari", "Aviation", "Centre-ville"],
    "Fes": ["Bab Bou Jeloud", "Medina", "Ville Nouvelle", "Borj Nord", "Saiss", "Bensouda", "Narjiss", "Atlas", "Jnan El Ouard", "Centre-ville"],
    "Marrakech": ["Jemaa el-Fna", "Medina", "Gueliz", "Hivernage", "Palmeraie", "Mellah", "Daoudiate", "Massira", "Targa", "Centre-ville"],
    "Tanger": ["Centre-ville", "Medina", "Malabata", "Marshan", "Beni Makada", "Cap Spartel", "Merkala", "Achakar", "Charf", "Boukhalef"],
    "Agadir": ["Centre-ville", "Talborjt", "Nouveau Talborjt", "Hay Mohammadi", "Founty", "Charaf", "Bensergao", "Anza", "Dcheira", "Tikiouin"],
    "Meknes": ["Centre-ville", "Medina", "Hamria", "Hay Salam", "Bassatine", "Ismailiya", "Marjane", "Zitoune", "Borj Moulay Omar", "Wislane"],
    "Oujda": ["Centre-ville", "Medina", "Hay Al Qods", "Lazaret", "Sidi Maafa", "Hay Riad", "Isly", "Boudir", "Naima", "Angad"],
    "Kenitra": ["Centre-ville", "Medina", "Hay Riad", "Saknia", "Bir Rami", "Ouled Oujih", "Mehdia", "Sidi Taibi", "Mnasra", "Bouknadel"],
    "Tetouan": ["Centre-ville", "Medina", "Martil", "Mdiq", "Cabo Negro", "Azla", "Oued Laou", "Fnideq", "Restinga", "Smir"],
    "Essaouira": ["Medina", "Centre-ville", "Hay Salam", "Diabat", "Ghazoua", "Hay Riad", "Hay Mohammadi", "Hay Al Majd", "Hay Isly", "Hay Al Amal"],
    "Ouarzazate": ["Centre-ville", "Hay Riad", "Taourirt", "Tifoultoute", "Hay Salam", "Hay Mohammadi", "Hay Al Majd", "Hay Isly", "Hay Al Amal", "Tabount"],
    "Chefchaouen": ["Medina", "Centre-ville", "Hay Salam", "Hay Riad", "Hay Mohammadi", "Hay Al Majd", "Hay Isly", "Hay Al Amal", "Ras El Maa", "Bab El Ain"],
    "El Jadida": ["Centre-ville", "Medina Portugaise", "Hay Hassani", "Hay Al Massira", "Azemmour", "Haouzia", "Sidi Bouzid", "Bir Jdid", "Moulay Abdallah", "Hay Riad"],
    "Beni Mellal": ["Centre-ville", "Hay Riad", "Hay Mohammadi", "Ain Asserdoun", "Oulad Yaich", "Hay Salam", "Hay Al Majd", "Tagzirt", "Hay Isly", "Hay Al Amal"],
    "Nador": ["Centre-ville", "Medina", "Hay Riad", "Beni Enzar", "Selouane", "Hay Mohammadi", "Hay Salam", "Hay Al Qods", "Taouima", "Zaio"],
    "Safi": ["Centre-ville", "Medina", "Hay Salam", "Arsat Lmassira", "Lamrasla", "Hay Al Majd", "Ryad", "Sidi Bouzid", "Hay Moulay Ismail", "Hay Essalam"],
    "Errachidia": ["Centre-ville", "Hay Riad", "Hay Salam", "Hay Mohammadi", "Hay Al Majd", "Hay Isly", "Hay Al Amal", "Ksar Es Souk", "Hay Hassani", "Hay Al Qods"],
    "Dakhla": ["Centre-ville", "Hay Riad", "Hay Salam", "Hay Mohammadi", "Hay Al Majd", "Hay Isly", "Hay Al Amal", "Hay Hassani", "Hay Al Qods", "Hay Annahda"],
    "Laayoune": ["Centre-ville", "Hay Riad", "Hay Salam", "Hay Mohammadi", "Hay Al Majd", "Hay Isly", "Hay Al Amal", "Hay Hassani", "Hay Al Qods", "Hay Annahda"]
};

let map, maLat = 33.5731, maLon = -7.5898;
let monMarqueur, cercle, marqueurs = [], mapInitialized = false, itineraireLayer = null;

function chargerAdresses(villeId, adresseId) {
    var ville = document.getElementById(villeId).value;
    var sel = document.getElementById(adresseId);
    sel.innerHTML = '';
    var def = document.createElement('option');
    def.value = '';
    def.textContent = (ville && adressesVilles[ville]) ? '-- Choisir un quartier --' : '-- Choisir une ville --';
    sel.appendChild(def);
    if (ville && adressesVilles[ville]) {
        adressesVilles[ville].forEach(function(a) {
            var o = document.createElement('option');
            o.value = a; o.textContent = a;
            sel.appendChild(o);
        });
    }
}

function selectionnerVille(ville) {
    document.getElementById('ville-home').value = ville;
    chargerAdresses('ville-home', 'adresse-home');
}

async function lancerRecherche() {
    var ville = document.getElementById('ville-home').value;
    var adresse = document.getElementById('adresse-home').value;
    var rayon = document.getElementById('rayon-home').value;
    if (!ville) { alert('Veuillez choisir une ville !'); return; }

    document.getElementById('page-accueil').style.display = 'none';
    document.getElementById('page-resultats').style.display = 'block';
    document.getElementById('search-info').textContent = ville + (adresse ? ' — ' + adresse : '') + ' • ' + rayon + ' km';
    document.getElementById('statut').textContent = 'Recherche en cours...';

    if (!mapInitialized) {
        map = L.map('map').setView([33.5731, -7.5898], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OpenStreetMap' }).addTo(map);
        mapInitialized = true;
    }

    try {
        var r1 = adresse ? (adresse + ', ' + ville + ', Maroc') : (ville + ', Maroc');
        var url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(r1) + '&format=json&limit=1';
        var res = await fetch(url, { headers: { 'User-Agent': 'ProjetGeo/1.0' } });
        var data = await res.json();
        if (!data.length) {
            url = 'https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent(ville + ', Maroc') + '&format=json&limit=1';
            res = await fetch(url, { headers: { 'User-Agent': 'ProjetGeo/1.0' } });
            data = await res.json();
        }
        if (!data.length) { document.getElementById('statut').textContent = 'Ville non trouvee !'; return; }
        maLat = parseFloat(data[0].lat);
        maLon = parseFloat(data[0].lon);
        map.setView([maLat, maLon], 14);
        ajouterMonMarqueur(maLat, maLon);
        await chargerHotelsVille(maLat, maLon);
        await rechercherHotels(parseFloat(rayon));
    } catch(e) {
        console.error(e);
        document.getElementById('statut').textContent = 'Erreur de connexion !';
    }
}

async function maPositionGPS() {
    if (!navigator.geolocation) return;
    document.getElementById('page-accueil').style.display = 'none';
    document.getElementById('page-resultats').style.display = 'block';
    document.getElementById('statut').textContent = 'Detection GPS...';
    if (!mapInitialized) {
        map = L.map('map').setView([33.5731, -7.5898], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'OpenStreetMap' }).addTo(map);
        mapInitialized = true;
    }
    navigator.geolocation.getCurrentPosition(async function(pos) {
        maLat = pos.coords.latitude; maLon = pos.coords.longitude;
        map.setView([maLat, maLon], 14);
        ajouterMonMarqueur(maLat, maLon);
        document.getElementById('search-info').textContent = 'Ma position GPS - 3 km';
        await chargerHotelsVille(maLat, maLon);
        await rechercherHotels(3);
    });
}

function retourAccueil() {
    document.getElementById('page-resultats').style.display = 'none';
    document.getElementById('page-accueil').style.display = 'block';
}

function ajouterMonMarqueur(lat, lon) {
    if (monMarqueur) map.removeLayer(monMarqueur);
    monMarqueur = L.marker([lat, lon], {
        icon: L.divIcon({ className: '', html: '<div style="background:red;width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(0,0,0,0.5)"></div>', iconSize: [16, 16] })
    }).addTo(map).bindPopup('Ma Position').openPopup();
}

async function chargerHotelsVille(lat, lon) {
    document.getElementById('statut').textContent = 'Chargement des hotels...';
    var res = await fetch('/api/charger-ville', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat: lat, lon: lon }) });
    var data = await res.json();
    document.getElementById('statut').textContent = data.total + ' hotels charges';
}

async function rechercherHotels(rayon) {
    marqueurs.forEach(function(m) { map.removeLayer(m); });
    marqueurs = [];
    if (cercle) map.removeLayer(cercle);

    cercle = L.circle([maLat, maLon], { radius: rayon * 1000, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.08, weight: 2 }).addTo(map);

    var res = await fetch('/api/recherche', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lat: maLat, lon: maLon, rayon: rayon }) });
    var hotels = await res.json();

    document.getElementById('nb-resultats').textContent = hotels.length + ' hotels trouves';
    var liste = document.getElementById('liste-hotels');
    liste.innerHTML = '';

    hotels.forEach(function(h, i) {

        // ===== MARQUEUR =====
        var marqueur = L.marker([h.lat, h.lon], {
            icon: L.divIcon({ className: '', html: '<div style="background:#3b82f6;color:#fff;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">' + (i+1) + '</div>', iconSize: [26, 26] })
        }).addTo(map);

        // ===== POPUP — seulement nom + étoiles + distance =====
        var popupStars = '';
        if (h.stars) {
            var nbp = parseInt(h.stars);
            for (var sp = 0; sp < nbp; sp++) popupStars += '★';
            for (var sp = nbp; sp < 5; sp++) popupStars += '☆';
        }

        marqueur.bindPopup(
            '<div style="min-width:180px;font-family:sans-serif;padding:12px;">' +
            '<div style="font-size:14px;font-weight:600;color:#1e293b;margin-bottom:5px;">🏨 ' + h.nom + '</div>' +
            '<div style="font-size:12px;margin-bottom:5px;">' +
            (popupStars ? '<span style="color:#f59e0b;">' + popupStars + '</span>' : '<span style="color:#94a3b8;font-size:11px;">Etoiles non disponibles</span>') +
            '</div>' +
            '<div style="font-size:11px;color:#64748b;">📏 ' + h.distance + ' km de vous</div>' +
            '</div>',
            { maxWidth: 220 }
        );

        // ===== LIGNE =====
        var ligne = L.polyline([[maLat, maLon], [h.lat, h.lon]], { color: '#3b82f6', weight: 1.5, opacity: 0.4 }).addTo(map);
        marqueurs.push(marqueur);
        marqueurs.push(ligne);

        // ===== CARD EN BAS — Design D avec boutons =====
        var card = document.createElement('div');
        card.className = 'hotel-card';

        var googleMapsUrl = 'https://www.google.com/maps/search/' + encodeURIComponent(h.nom) + '/@' + h.lat + ',' + h.lon + ',17z';

        var badgeEtoile = '';
        if (h.stars) {
            var nbE = parseInt(h.stars);
            badgeEtoile = '<div style="display:flex;align-items:center;gap:3px;background:#fefce8;border-radius:6px;padding:2px 7px;flex-shrink:0;">' +
                '<span style="font-size:12px;color:#ca8a04;">&#9733;</span>' +
                '<span style="font-size:11px;color:#ca8a04;font-weight:500;">' + nbE + '.0</span>' +
                '</div>';
        } else {
            badgeEtoile = '<div style="display:flex;align-items:center;gap:3px;background:#f8fafc;border-radius:6px;padding:2px 7px;flex-shrink:0;">' +
                '<span style="font-size:12px;color:#cbd5e1;">&#9733;</span>' +
                '<span style="font-size:11px;color:#cbd5e1;font-weight:500;">—</span>' +
                '</div>';
        }

        var badgeEtoileHeader = '';
        if (h.stars) {
            var nbE = parseInt(h.stars);
            badgeEtoileHeader =
                '<div style="display:flex;align-items:center;gap:2px;">' +
                '<span style="font-size:11px;color:#ca8a04;">&#9733;</span>' +
                '<span style="font-size:11px;color:#ca8a04;font-weight:500;">' + nbE + '.0</span>' +
                '</div>';
        } else {
            badgeEtoileHeader =
                '<div style="display:flex;align-items:center;gap:2px;">' +
                '<span style="font-size:11px;color:#475569;">&#9733;</span>' +
                '<span style="font-size:11px;color:#475569;font-weight:500;">—</span>' +
                '</div>';
        }

        var googleMapsUrl = 'https://www.google.com/maps/search/' + encodeURIComponent(h.nom) + '/@' + h.lat + ',' + h.lon + ',17z';

        card.innerHTML =
            '<div style="background:#1e293b;padding:8px 12px;display:flex;justify-content:space-between;align-items:center;">' +
            '<div style="width:22px;height:22px;background:#3b82f6;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;color:white;font-weight:500;">' + (i+1) + '</div>' +
            badgeEtoileHeader +
            '</div>' +
            '<div style="padding:10px 12px;">' +
            '<div style="font-size:12px;font-weight:500;color:#1e293b;margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + h.nom + '">' + h.nom + '</div>' +
            '<div style="font-size:11px;color:#64748b;margin-bottom:10px;">' + h.distance + ' km</div>' +
            '<div style="display:flex;gap:5px;">' +
            '<button onclick="event.stopPropagation();afficherItineraire(' + h.lat + ',' + h.lon + ',\'' + h.nom.replace(/'/g, '') + '\');" ' +
            'style="flex:1;background:#1e293b;color:white;border:none;padding:7px 0;border-radius:6px;font-size:10px;cursor:pointer;font-weight:500;">🗺️ Chemin</button>' +
            '<a href="' + googleMapsUrl + '" target="_blank" onclick="event.stopPropagation();" ' +
            'style="flex:1;background:#4285f4;color:white;text-decoration:none;text-align:center;padding:7px 0;border-radius:6px;font-size:10px;font-weight:500;display:block;">📍 Maps</a>' +
            '</div>' +
            '</div>';

        card.style.cssText = 'cursor:pointer;min-width:155px;max-width:190px;background:#ffffff;border:0.5px solid #e2e8f0;border-radius:12px;overflow:hidden;flex-shrink:0;transition:all 0.2s;';
        card.onmouseover = function() { this.style.borderColor = '#3b82f6'; this.style.transform = 'translateY(-2px)'; };
        card.onmouseout = function() { this.style.borderColor = '#e2e8f0'; this.style.transform = 'translateY(0)'; };
        card.onclick = function() { map.setView([h.lat, h.lon], 17); marqueur.openPopup(); };        liste.appendChild(card);
    });
}

async function afficherItineraire(hotelLat, hotelLon, hotelNom) {
    if (itineraireLayer) { map.removeLayer(itineraireLayer); itineraireLayer = null; }
    document.getElementById('statut').textContent = 'Calcul du chemin...';
    try {
        var url = 'https://router.project-osrm.org/route/v1/driving/' + maLon + ',' + maLat + ';' + hotelLon + ',' + hotelLat + '?overview=full&geometries=geojson';
        var res = await fetch(url);
        var data = await res.json();
        if (data.code !== 'Ok' || !data.routes.length) { document.getElementById('statut').textContent = 'Itineraire non trouve'; return; }
        var route = data.routes[0];
        var coords = route.geometry.coordinates.map(function(c) { return [c[1], c[0]]; });
        var distKm = (route.distance / 1000).toFixed(1);
        var dureeMin = Math.round(route.duration / 60);
        itineraireLayer = L.layerGroup();
        L.polyline(coords, { color: '#1d4ed8', weight: 8, opacity: 0.3 }).addTo(itineraireLayer);
        L.polyline(coords, { color: '#3b82f6', weight: 5, opacity: 0.8 }).addTo(itineraireLayer);
        itineraireLayer.addTo(map);
        map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
        var mid = Math.floor(coords.length / 2);
        L.popup().setLatLng(coords[mid]).setContent(
            '<div style="text-align:center;padding:8px;">' +
            '<b>🏨 ' + hotelNom + '</b><br>' +
            '🚗 <b>' + distKm + ' km</b> — ⏱️ <b>' + dureeMin + ' min</b><br>' +
            '<button onclick="supprimerItineraire()" style="margin-top:8px;background:#ef4444;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;font-size:11px;">❌ Supprimer</button>' +
            '</div>'
        ).openOn(map);
        document.getElementById('statut').textContent = distKm + ' km — ' + dureeMin + ' min en voiture';
    } catch(e) {
        document.getElementById('statut').textContent = 'Erreur calcul itineraire';
    }
}

function supprimerItineraire() {
    if (itineraireLayer) { map.removeLayer(itineraireLayer); itineraireLayer = null; }
    document.getElementById('statut').textContent = 'Itineraire supprime';
    map.closePopup();
}

window.onload = function() {};