/* 
* Baslangicta kullanicinin konumuna erismeliyiz. Bu sayede haritanin baslangic yerini belirleyecegiz.


*/

import { personIcon } from "./constants.js";
import { getNoteIcon, getStatus } from "./helpers.js";
import elements from "./ui.js";

// Global Degiskenler
var map;
let clickedCoords;
let layer;
// Localstorage'dan notes keyine sahip elemanları al
let notes = JSON.parse(localStorage.getItem("notes")) || [];

// window icerisindeki navigator objesi icerisinde kullanicinin acmis oldugu sekme ile alakali bircok veriyi bulundurur. (koordinat, tarayici ile alakali veriler, pc ile alakali veriler) Bizde bu yapi icerisindeki geolocation yapisiyla koordinat verisine eristik .  Geolocation icerisinde getCurrentPosition kullanicin mevcut konumu almak icin kullanilir. Bu fonk icerisinde iki adet callBack fonk. ister birincisi kullanicin konum bilgisini paylasmasi durumunda ikincisi paylasmamasi durumunda calisir.

window.navigator.geolocation.getCurrentPosition(
  (e) => {
    //Konum bilgisi paylasildiginda
    loadMap([e.coords.latitude, e.coords.longitude], "Mevcut Konum");
  },
  (e) => {
    //Konum bilgisi paylasilmadiginda
    loadMap([50.6484749, 5.5118715], "Varsayilan konum");
  }
);
//! Haritayi olusturan fonk.
function loadMap(currentPosition, msg) {
  map = L.map("map", {
    zoomControl: false,
  }).setView(currentPosition, 12);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Zoom araclarinin konumunu belirle
  L.control
    .zoom({
      position: "bottomright",
    })
    .addTo(map);
  // Ekrana basilacak bir

  layer = L.layerGroup().addTo(map);

  //Kullanicinin baslangic konumuna bir marker ekle
  L.marker(currentPosition, { icon: personIcon }).addTo(map).bindPopup(msg);

  // Harita uzeinde tiklanma olayini izle
  map.on("click", onMapClick);

  //Notlari render edecek fonk.
  renderNotes();

  // Markerları render eden fonksiyon
  renderMarkers();
}
//! haritaya tiklandiginda calisacak fonksiyon.
function onMapClick(e) {
  // Tıklanılan yerin kordinatlarına eriş
  clickedCoords = [e.latlng.lat, e.latlng.lng];

  // Aside'a add classını ekle
  elements.aside.classList.add("add");
}

// ! Form gönderildiğinde çalışacak fonksiyon
elements.form.addEventListener("submit", (e) => {
  // Sayfa yenilemeyi engelle
  e.preventDefault();

  //Form icerisindeki degere eris
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  // Bir tane not objesi oluştur

  const newNote = {
    id: new Date().getTime(),
    title,
    date,
    status,
    coords: clickedCoords,
  };

  // Not dizisine yeni notu ekle
  notes.push(newNote);

  // Locakstorage'a notlari kaydet
  localStorage.setItem("notes", JSON.stringify(notes));

  //Formu resetle
  e.target.reset();

  //Aside'i eski haline getir
  elements.aside.classList.remove("add");

  //Notelari render et
  renderNotes();

  // Markerlari render eden fonksiyon
  renderMarkers();
});

//Close btn'e tiklaninca aside'i tekrardan eski haline getir
elements.cancelBtn.addEventListener("click", () => {
  elements.aside.classList.remove("add");
});

// Mevcut notlari render eden bir fonk
function renderNotes() {
  //note dizisini donerek herbir not icin bir html olustur
  const noteCard = notes
    .map((note) => {
      // Tarih ayarlaması
      const date = new Date(note.date).toLocaleDateString("tr", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      //Status ayarlamasi
      //  getStatus adında bir fonksiyon yazıldı.Bu fonksiyon kendisine verilen status değerine göre uygun ifadeyi return etti
      return ` <li>

      <div>
        <p>${note.title}</p>
        <p>${date}</p>
        <p>${getStatus(note.status)}</p>
        
      </div>
  
      <div class="icons">
        <i data-id='${note.id}' class="bi bi-airplane-fill" id="fly-btn"></i>
        <i data-id='${note.id}' class="bi bi-trash" id="delete-btn"></i>
      </div>
    </li>`;
    })
    .join("");

  // Ilgili html'i arayuze eekle
  elements.noteList.innerHTML = noteCard;
  // Delete iconlarina eris
  document.querySelectorAll("#delete-btn").forEach((btn) => {
    // Delete iconuna data id'sine eris
    const id = btn.dataset.id;

    // Delete iconlarina tiklayinca delete note fonksiyonlarini calistir
    btn.addEventListener("click", () => {
      deleteNote(id);
    });
  });

  //Fly iconlara eris
  document.querySelectorAll("#fly-btn").forEach((btn) => {
    //Fly Btn'e tiklaninca flyNote fonk. calistir

    btn.addEventListener("click", () => {
      //Fly btn inin idsine eris
      const id = +btn.dataset.id;
      flyToNote(id);
    });
  });
}

// Her not icin bir marker render eden fonksiyon
function renderMarkers() {
  //Haritadaki maelerlari sifirlar
  layer.clearLayers();
  notes.map((note) => {
    //eklenecek ikonun turune karar ver
    const icon = getNoteIcon(note.status);
    // Not icin bir marker olustur
    L.marker(note.coords, { icon }).addTo(layer).bindPopup(note.title);
  });
}

// Deelete Function
function deleteNote(id) {
  //Kullanicidan onay al
  const res = confirm("Not silme islemini onayliyor musunuz?");

  // Eger kullanici onayladiysa
  if (res) {
    //Id'si bilinen not'u note dizisinden kaldir
    notes = notes.filter((note) => note.id != id);

    console.log(notes);
    // localstorage'i guncelle
    localStorage.setItem("notes", JSON.stringify(notes));

    //notlari render et
    renderNotes();

    // markerleri render et
    renderMarkers();
  }
}
//Notlara focuslanan fonk.
function flyToNote(id) {
  // Id'si bilinen notu note dizisinin icerisinden bul
  const foundedNote = notes.find((note) => id == id);

  //Bulunan note fokuslan
  map.flyTo(foundedNote.coords, 12);
}
//arrowIcon'a tiklaninca calisacak fonk.
elements.arrowIcon.addEventListener("click", () => {
  elements.aside.classList.toggle("hide");
});
