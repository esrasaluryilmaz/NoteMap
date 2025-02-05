/* 
* Baslangicta kullanicinin konumuna erismeliyiz. Bu sayede haritanin baslangic yerini belirleyecegiz.


*/

import { personIcon } from "./constants.js";
import elements from "./ui.js";

//Global Degiskenler
var map;
let clickedCoords;
let notes = JSON.parse(localStorage.getItem("notes"));

// window icerisindeki navigator objesi icerisinde kullanicinin acmis oldugu sekme ile alakali bircok veriyi bulundurur. (koordinat, tarayici ile alakali veriler, pc ile alakali veriler) Bizde bu yapi icerisindeki geolocation yapisiyla koordinat verisine eristik .  Geolocation icerisinde getCurrentPosition kullanicin mevcut konumu almak icin kullanilir. Bu fonk icerisinde iki adet callBack fonk. ister birincisi kullanicin konum bilgisini paylasmasi durumunda ikincisi paylasmamasi durumunda calisir.

window.navigator.geolocation.getCurrentPosition(
  (e) => {
    //Konum bilgisi paylasildiginda
    loadMap([e.coords.latitude, e.coords.longitude], "Mevcut konum");
  },
  (e) => {
    //Konum bilgisi paylasilmadiginda
    loadMap([46.497204, 9.837988], "Varsayilan konum");
  }
);
//! Haritayi olusturan fonk.
function loadMap(currentPosition, msg) {
  map = L.map("map", { zoomControl: false }).setView(currentPosition, 12);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Zoom araclarinin konumunu belirle
  // Ekrana basilacak bir

  let layer = L.layerGroup().addTo(map);
  //Kullanicinin baslangic konumuna bir marker ekle
  L.marker(currentPosition, { icon: personIcon }).addTo(map).bindPopup(msg);

  // Harita uzeinde tiklanma olayini izle
  map.on("click", onMapClick);
}
//! haritaya tiklandiginda calisacak fonksiyon.
function onMapClick(e) {
  //Tiklanilan yerin kordinatlarina eris
  clickedCoords = [e.latlng.lat, e.latlng.lng];

  //Aside'a add classini ekle
  elements.aside.classList.add("add");
}

//! Form gonderildiginde calisacak fonksiyon
elements.form.addEventListener("submit", (e) => {
  //Sayfa yenilemeyi engelle
  e.preventDefault();

  //Form icerisindeki degere eris
  const title = e.target[0].value;
  const date = e.target[1].value;
  const status = e.target[2].value;

  //Bir tane not objesi olustur
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
  localStorage.setItem("notes", JSON.stringify(newNote));

  //Formu resetle
  e.target.reset();

  //Aside'i eski haline getir
  elements.aside.classList.remove("add");

  //Notelari render et

  renderNotees();
});

//Close btn'e tiklaninca aside'i tekrardan eski haline getir
elements.cancelBtn.addEventListener("click", () => {
  elements.aside.classList.remove("add");
});

// Mevcut notlari render eden bir fonk
function renderNotees() {
  //note dizisini donerek herbir not icin bir html olustur
  const noteCard = notes.map(
    (note) => ` <li>
          <div>
            <p>İstanbul Gezi</p>
            <p>13 Ocak 2025</p>
            <p>Park</p>
          </div>

          <div class="icons">
            <i class="bi bi-airplane-fill" id="fly-btn"></i>
            <i class="bi bi-trash" id="delete-btn"></i>
          </div>
        </li>`
  );

  // Ilgili html'i arayuze eekle
  elements.noteList.innerHtml = noteCard;
}
