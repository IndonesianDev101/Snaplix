import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBPwQtXl6K3LQ-8lgEDVk4coWBeSgikWbI",
  authDomain: "snaplix-d4a24.firebaseapp.com",
  projectId: "snaplix-d4a24",
  storageBucket: "snaplix-d4a24.firebasestorage.app",
  messagingSenderId: "13413540302",
  appId: "1:13413540302:web:2483c1c4540e7149b90b9f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Fungsi Toggle Modal
window.toggleModal = () => {
    const modal = document.getElementById('uploadModal');
    modal.classList.toggle('hidden');
};

// Fungsi Upload
document.getElementById('btnUpload').addEventListener('click', async () => {
    const file = document.getElementById('fileInput').files[0];
    const caption = document.getElementById('captionInput').value;
    
    if (!file) return alert("Pilih file dulu!");

    const storageRef = ref(storage, 'posts/' + file.name);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    await addDoc(collection(db, "posts"), {
        url: url,
        type: file.type.split('/')[0], // image atau video
        caption: caption,
        likes: 0,
        comments: [],
        timestamp: new Date()
    });

    toggleModal();
    alert("Berhasil posting!");
});

// Load Postingan secara Realtime
const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
onSnapshot(q, (snapshot) => {
    const container = document.getElementById('feed-container');
    container.innerHTML = "";
    
    snapshot.forEach((docSnap) => {
        const post = docSnap.data();
        const postId = docSnap.id;
        
        const postElement = `
            <div class="bg-white border rounded-sm mb-8">
                <div class="p-3 flex justify-between items-center">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-purple-600 rounded-full"></div>
                        <span class="font-semibold text-sm text-blue-500 cursor-pointer">Follow Creator</span>
                    </div>
                </div>
                
                ${post.type === 'image' 
                    ? `<img src="${post.url}" class="w-full object-cover">` 
                    : `<video src="${post.url}" controls class="w-full"></video>`}
                
                <div class="p-4">
                    <div class="flex space-x-4 text-2xl mb-2">
                        <i class="far fa-heart cursor-pointer hover:text-red-500" onclick="likePost('${postId}')"></i>
                        <i class="far fa-comment cursor-pointer"></i>
                    </div>
                    <p class="font-bold text-sm mb-1">${post.likes} suka</p>
                    <p class="text-sm"><span class="font-bold">User</span> ${post.caption}</p>
                    
                    <div class="mt-2 text-gray-500 text-xs uppercase">Lihat semua ${post.comments.length} komentar</div>
                    <div id="comment-list-${postId}" class="mt-2 text-sm">
                        ${post.comments.slice(-2).map(c => `<div><span class="font-bold">Anon</span> ${c}</div>`).join('')}
                    </div>
                    
                    <div class="mt-4 border-t pt-3 flex">
                        <input type="text" id="input-${postId}" placeholder="Tambah komentar..." class="w-full text-sm outline-none">
                        <button onclick="addComment('${postId}')" class="text-blue-500 font-semibold text-sm">Kirim</button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += postElement;
    });
});

// Fungsi Like
window.likePost = async (id) => {
    const postRef = doc(db, "posts", id);
    // Logika sederhana: tambah 1 (bisa dikembangkan dengan ID User agar tidak spam)
    await updateDoc(postRef, {
        likes: Math.floor(Math.random() * 100) // Contoh simulasi
    });
};

// Fungsi Komentar
window.addComment = async (id) => {
    const input = document.getElementById(`input-${id}`);
    if (!input.value) return;

    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
        comments: arrayUnion(input.value)
    });
    input.value = "";
};
// Tambahkan ini di akhir file app.js Anda
window.toggleModal = () => {
    const modal = document.getElementById('uploadModal');
    modal.classList.toggle('hidden');
};

window.likePost = async (id) => {
    // Logika like
    console.log("Menyukai postingan:", id);
    const postRef = doc(db, "posts", id);
    // Contoh update sederhana
    await updateDoc(postRef, {
        likes: Math.floor(Math.random() * 10) + 1 
    });
};

window.addComment = async (id) => {
    const input = document.getElementById(`input-${id}`);
    if (!input.value) return;

    const postRef = doc(db, "posts", id);
    await updateDoc(postRef, {
        comments: arrayUnion(input.value)
    });
    input.value = "";
    alert("Komentar terkirim!");
};