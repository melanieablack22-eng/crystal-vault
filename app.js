const firebaseConfig = {
  apiKey: "PASTE_HERE",
  authDomain: "PASTE_HERE",
  projectId: "PASTE_HERE",
  storageBucket: "PASTE_HERE",
  messagingSenderId: "PASTE_HERE",
  appId: "PASTE_HERE"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const storage = firebase.storage();

let editingId = null;

async function saveCrystal() {
  const file = photo.files[0];
  let imageURL = null;

  if (file) {
    const ref = storage.ref(`crystals/${Date.now()}-${file.name}`);
    await ref.put(file);
    imageURL = await ref.getDownloadURL();
  }

  const data = {
    name: name.value,
    type: type.value,
    price: Number(price.value),
    source: source.value,
    notes: notes.value,
    photo: imageURL
  };

  if (editingId) {
    await db.collection("crystals").doc(editingId).update(data);
  } else {
    await db.collection("crystals").add(data);
  }

  resetForm();
}

function editCrystal(id, data) {
  editingId = id;
  name.value = data.name;
  type.value = data.type;
  price.value = data.price;
  source.value = data.source;
  notes.value = data.notes;

  formTitle.textContent = "Edit Crystal";
  cancelBtn.hidden = false;
}

async function deleteCrystal(id, photoURL) {
  if (!confirm("Delete this crystal?")) return;

  await db.collection("crystals").doc(id).delete();

  if (photoURL) {
    const ref = storage.refFromURL(photoURL);
    await ref.delete();
  }
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  editingId = null;
  formTitle.textContent = "Add Crystal";
  cancelBtn.hidden = true;

  name.value = "";
  type.value = "";
  price.value = "";
  source.value = "";
  notes.value = "";
  photo.value = "";
}

db.collection("crystals").onSnapshot(snapshot => {
  crystalList.innerHTML = "";

  snapshot.forEach(doc => {
    const c = doc.data();

    crystalList.innerHTML += `
      <li>
        ${c.photo ? `<img src="${c.photo}">` : ""}
        <strong>${c.name}</strong><br>
        ${c.type} • $${c.price}<br>
        <em>${c.notes}</em><br>
        <button onclick='editCrystal("${doc.id}", ${JSON.stringify(c)})'>Edit</button>
        <button onclick='deleteCrystal("${doc.id}", "${c.photo || ""}")'>Delete</button>
      </li>
    `;
  });
});
