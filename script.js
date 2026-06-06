/**
 * Logika Utama Mesin Deterministic Pushdown Automata (DPDA)
 * Mengenali bahasa L = { a^n b^n | n >= 0 }
 */
function runPDA(input) {
    let stack = ['Z0'];  // Z0 adalah simbol awal (bottom of stack)
    let state = 'q0';    // q0 adalah state awal
    let logs = [];       // Array untuk menyimpan history eksekusi

    // Simpan status sebelum mesin mulai membaca input
    logs.push({ 
        char: '-', 
        state: state, 
        stack: [...stack], 
        action: 'Inisialisasi Mesin (Start)' 
    });

    // Mulai membaca string karakter per karakter
    for (let i = 0; i < input.length; i++) {
        let char = input[i];
        let action = '';

        // --- Aturan Transisi State q0 (Fase membaca 'a') ---
        if (state === 'q0') {
            if (char === 'a') {
                stack.push('A'); 
                action = 'Push A';
            } 
            else if (char === 'b') {
                // Saat bertemu 'b' pertama kali, cek apakah ada 'a' sebelumnya
                if (stack[stack.length - 1] === 'A') {
                    stack.pop();
                    state = 'q1'; // Pindah state karena sudah mulai baca 'b'
                    action = 'Pop A, Pindah ke State q1';
                } else {
                    logs.push({ char, state, stack: [...stack], action: 'Crash (Stack kosong, b tidak memiliki pasangan a)' });
                    return { accepted: false, logs };
                }
            } 
            else {
                // Karakter selain 'a' atau 'b' langsung ditolak
                logs.push({ char, state, stack: [...stack], action: `Crash (Karakter tidak dikenali: ${char})` });
                return { accepted: false, logs };
            }
        } 
        
        // --- Aturan Transisi State q1 (Fase membaca 'b') ---
        else if (state === 'q1') {
            if (char === 'b') {
                if (stack[stack.length - 1] === 'A') {
                    stack.pop();
                    action = 'Pop A';
                } else {
                    logs.push({ char, state, stack: [...stack], action: 'Crash (Jumlah b lebih banyak dari a)' });
                    return { accepted: false, logs };
                }
            } 
            else {
                logs.push({ char, state, stack: [...stack], action: `Crash (Membaca ${char} setelah b tidak diizinkan)` });
                return { accepted: false, logs };
            }
        }

        // Simpan log setiap kali satu karakter selesai diproses
        logs.push({ char, state, stack: [...stack], action });
    }

    // --- Pengecekan Final (Transisi Epsilon) ---
    // String sudah habis. Kita cek apakah stack kembali ke kondisi awal (seimbang)
    if (stack.length === 1 && stack[0] === 'Z0') {
        state = 'q2'; // Berpindah ke Final State
        logs.push({ 
            char: 'ε (Epsilon)', 
            state: state, 
            stack: [...stack], 
            action: 'Mencapai Final State (Accepted)' 
        });
        return { accepted: true, logs };
    } else {
        logs.push({ 
            char: 'ε (Epsilon)', 
            state: state, 
            stack: [...stack], 
            action: 'Tertahan (Jumlah a lebih banyak dari b, stack bersisa)' 
        });
        return { accepted: false, logs };
    }
}

/**
 * Fungsi untuk menghubungkan logika PDA dengan HTML (User Interface)
 */
function processUI() {
    const inputString = document.getElementById('inputString').value;
    const resultBox = document.getElementById('resultBox');
    const logSection = document.getElementById('logSection');
    const tbody = document.getElementById('logTableBody');

    // 1. Jalankan mesin PDA
    const result = runPDA(inputString);
    
    // 2. Tampilkan Kotak Hasil (Accepted/Rejected)
    resultBox.classList.remove('hidden', 'accepted', 'rejected');
    if (result.accepted) {
        resultBox.textContent = `STRING "${inputString}" : ACCEPTED`;
        resultBox.classList.add('accepted');
    } else {
        resultBox.textContent = `STRING "${inputString}" : REJECTED`;
        resultBox.classList.add('rejected');
    }

    // 3. Tampilkan Tabel Log Visualisasi
    logSection.classList.remove('hidden');
    tbody.innerHTML = ''; // Bersihkan tabel dari pencarian sebelumnya
    
    result.logs.forEach(log => {
        const tr = document.createElement('tr');
        
        // Ubah array stack menjadi string teks (misal: [Z0, A, A])
        const stackDisplay = log.stack.join(', ');

        tr.innerHTML = `
            <td>${log.char}</td>
            <td>${log.state}</td>
            <td class="stack-col">[ ${stackDisplay} ]</td>
            <td>${log.action}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Tambahkan event listener saat tombol diklik
document.getElementById('btnUji').addEventListener('click', processUI);

// Opsional: Jalankan saat menekan tombol "Enter" di keyboard
document.getElementById('inputString').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        processUI();
    }
});