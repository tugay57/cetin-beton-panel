import './style.css'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://humkdnxdjrlxejtmvnfx.supabase.co',
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1bWtkbnhkanJseGVqdG12bmZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MTkxOTQsImV4cCI6MjA5NDQ5NTE5NH0.qAOBM7aKKZdwgzvt9MlrQG4JidNJodvZiekpIjfh4tg' 
)
import logo from './ctnLogo.png'
let aktifSayfa = 'dashboard'
let aramaMetni = ''
let girisYapildi = localStorage.getItem('girisYapildi') === 'true'
let aktifKullanici = localStorage.getItem('aktifKullanici') || ''

const KULLANICILAR = [
  {
    kullaniciAdi: 'tugay',
    sifre: '1234',
    yetki: 'Yönetici'
  },
  {
    kullaniciAdi: 'depo',
    sifre: '1111',
    yetki: 'Depo'
  },
  {
    kullaniciAdi: 'muhasebe',
    sifre: '2222',
    yetki: 'Muhasebe'
  }
]
let baslangicTarihi = ''
let bitisTarihi = ''

let stoklar = JSON.parse(localStorage.getItem('stoklar')) || [
  { urun: '15W40 Motor Yağı', marka: '', parcaKodu: '', kategori: 'Madeni Yağ', stok: 6, min: 2 },
  { urun: 'Hava Filtresi', marka: '', parcaKodu: '', kategori: 'Filtre', stok: 1, min: 2 },
  { urun: 'Balata Takımı', marka: '', parcaKodu: '', kategori: 'Fren Sistemi', stok: 4, min: 1 },
]

let araclar = JSON.parse(localStorage.getItem('araclar')) || [
  '57 AJ 411 - Mercedes Axor 3340 - Pompa',
  '57 ABP 867 - Ford Cargo 4142 - Damper',
  '57 ABL 821 - Ford Cargo 4142 - Mikser',
  '57 ABD 157 - Mercedes Axor 4140 - Mikser'
]

let tedarikciler = JSON.parse(localStorage.getItem('tedarikciler')) || [
  'ABC Yağ',
  'Filtre Market',
  'Parça Otomotiv'
]

let islemler = JSON.parse(localStorage.getItem('islemler')) || []
let aracGecmisi = JSON.parse(localStorage.getItem('aracGecmisi')) || {}
let tedarikciGecmisi = JSON.parse(localStorage.getItem('tedarikciGecmisi')) || {}

async function kaydet() {
  const data = {
    stoklar,
    araclar,
    tedarikciler,
    islemler,
    aracGecmisi,
    tedarikciGecmisi
  }

  localStorage.setItem('stoklar', JSON.stringify(stoklar))
  localStorage.setItem('araclar', JSON.stringify(araclar))
  localStorage.setItem('tedarikciler', JSON.stringify(tedarikciler))
  localStorage.setItem('islemler', JSON.stringify(islemler))
  localStorage.setItem('aracGecmisi', JSON.stringify(aracGecmisi))
  localStorage.setItem('tedarikciGecmisi', JSON.stringify(tedarikciGecmisi))

  const { error } = await supabase
    .from('panel_data')
    .upsert({
      id: 'ana-veri',
      data: data,
      updated_at: new Date().toISOString()
    })

  if (error) {
    console.error('Supabase kayıt hatası:', error)
  }
}

async function verileriYukle() {
  const { data, error } = await supabase
    .from('panel_data')
    .select('data')
    .eq('id', 'ana-veri')
    .single()

  if (error || !data) {
    console.log('Online veri bulunamadı, mevcut lokal veri kullanılacak.')
    await kaydet()
    ekraniCiz()
    return
  }

  stoklar = data.data.stoklar || stoklar
  araclar = data.data.araclar || araclar
  tedarikciler = data.data.tedarikciler || tedarikciler
  islemler = data.data.islemler || islemler
  aracGecmisi = data.data.aracGecmisi || aracGecmisi
  tedarikciGecmisi = data.data.tedarikciGecmisi || tedarikciGecmisi

  ekraniCiz()
}

function menu() {
  return `
    <div style="width:260px; background:#111827; color:white; padding:30px 20px;">
      
      <img 
        src="${logo}" 
        alt="Çetin Beton"
        style="
          width:100%;
          max-width:200px;
          margin-bottom:30px;
          object-fit:contain;
        "
      >

      <div style="margin-top:20px;">
      <div style="
  background:#1f2937;
  padding:10px;
  border-radius:10px;
  margin-bottom:20px;
  font-size:13px;
">
  Kullanıcı: ${aktifKullanici}
</div>

        <div class="menu-item ${aktifSayfa === 'dashboard' ? 'active-menu' : ''}" onclick="sayfaDegistir('dashboard')">
          📊 Dashboard
        </div>

        <div class="menu-item ${aktifSayfa === 'stok' ? 'active-menu' : ''}" onclick="sayfaDegistir('stok')">
          📦 Stok Yönetimi
        </div>

        <div class="menu-item ${aktifSayfa === 'araclar' ? 'active-menu' : ''}" onclick="sayfaDegistir('araclar')">
          🚛 Araçlar
        </div>

        <div class="menu-item ${aktifSayfa === 'tedarikciler' ? 'active-menu' : ''}" onclick="sayfaDegistir('tedarikciler')">
          🏢 Tedarikçiler
        </div>

        <div class="menu-item ${aktifSayfa === 'raporlar' ? 'active-menu' : ''}" onclick="sayfaDegistir('raporlar')">
          📈 Raporlar
        </div>
        <div class="menu-item" onclick="cikisYap()">
  🚪 Çıkış Yap
</div>

      </div>
    </div>
  `
}

function dashboardSayfasi() {
  return `
    <h1>Dashboard</h1>

    <div style="display:flex; gap:20px; margin-top:30px; flex-wrap:wrap;">
      <div class="card">
        <h3>Toplam Ürün</h3>
        <p style="font-size:30px;">${stoklar.length}</p>
      </div>

      <div class="card">
        <h3>Kritik Ürün</h3>
        <p class="red" style="font-size:30px;">
          ${stoklar.filter(item => item.stok <= item.min).length}
        </p>
      </div>

      <div class="card">
        <h3>Araç Sayısı</h3>
        <p class="green" style="font-size:30px;">${araclar.length}</p>
      </div>

      <div class="card">
        <h3>Tedarikçi Sayısı</h3>
        <p style="font-size:30px;">${tedarikciler.length}</p>
      </div>
    </div>

    <div class="card" style="margin-top:30px;">
      <h2>Son İşlemler</h2>
      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>İşlem</th>
            <th>Ürün</th>
            <th>Miktar</th>
            <th>Araç / Tedarikçi</th>
          </tr>
        </thead>
        <tbody>
          ${islemler.slice(0, 10).map(islem => `
            <tr>
              <td>${islem.tarih}</td>
              <td>${islem.tur}</td>
              <td>${islem.urun}</td>
              <td>${islem.miktar}</td>
              <td>${islem.detay}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

function stokSayfasi() {
  return `
    <h1>Stok Yönetimi</h1>

    <div class="card" style="margin-top:20px;">
      <input 
        id="aramaKutusu" 
        placeholder="Ürün ara... örn: balata, filtre, yağ" 
        value="${aramaMetni}"
        style="width:100%;"
      >
    </div>

    <div class="card" style="margin-top:30px;">
      <h2>Yeni Ürün Ekle</h2>

      <div class="form-grid">
        <input id="urun" placeholder="Ürün adı">
        <input id="marka" placeholder="Marka">
        <input id="parcaKodu" placeholder="Parça kodu">
        <input id="kategori" placeholder="Kategori">
        <input id="stok" type="number" placeholder="Stok miktarı">
        <input id="min" type="number" placeholder="Minimum stok">
        <button id="urunEkleBtn">Ürün Ekle</button>
      </div>
    </div>

    <div class="card" style="margin-top:30px;">
      <h2>Stok Listesi</h2>

      <table>
        <thead>
          <tr>
            <th>Ürün Adı</th>
            <th>Marka</th>
            <th>Parça Kodu</th>
            <th>Kategori</th>
            <th>Stok</th>
            <th>Min. Stok</th>
            <th>Durum</th>
            <th>İşlem</th>
          </tr>
        </thead>

        <tbody id="stokTablosu">
          ${stoklar
            .filter(item => 
              item.urun.toLowerCase().includes(aramaMetni.toLowerCase()) ||
              item.kategori.toLowerCase().includes(aramaMetni.toLowerCase()) ||
              (item.marka || '').toLowerCase().includes(aramaMetni.toLowerCase()) ||
              (item.parcaKodu || '').toLowerCase().includes(aramaMetni.toLowerCase())
            )
            .map((item, index) => `
              <tr>
                <td>${item.urun}</td>
                <td>${item.marka || '-'}</td>
                <td>${item.parcaKodu || '-'}</td>
                <td>${item.kategori}</td>
                <td>${item.stok}</td>
                <td>${item.min}</td>
                <td>
                  ${
                    item.stok <= item.min
                      ? '<span class="badge red-bg">Kritik</span>'
                      : '<span class="badge green-bg">Normal</span>'
                  }
                </td>
                <td>
                  <button class="small-btn" onclick="stokGiris(${index})">+ Giriş</button>
                  <button class="small-btn danger" onclick="stokCikis(${index})">- Çıkış</button>
                  <button class="small-btn" onclick="urunDuzenle('${item.urun}')">Düzenle</button>
                  <button class="small-btn danger" onclick="urunSil('${item.urun}')">Sil</button>
                </td>
              </tr>
            `).join('')}
        </tbody>
      </table>
    </div>
  `
}

function araclarSayfasi() {
  return `
    <h1>Araçlar</h1>
    <div class="card" style="margin-top:20px;">
  <h2>Tarih Aralığı</h2>

  <div class="form-grid">
  <input id="baslangicTarihi" type="date">
  <input id="bitisTarihi" type="date">
  <button onclick="tarihFiltresiUygula()">Filtrele</button>
  <button onclick="window.print()">PDF / Yazdır</button>
</div>
</div>

    <div class="card" style="margin-top:30px;">
      <h2>Yeni Araç Ekle</h2>

      <div class="form-grid">
        <input id="aracAdi" placeholder="Plaka - Marka Model - Tip">
        <button id="aracEkleBtn">Araç Ekle</button>
      </div>
    </div>

    <div class="card" style="margin-top:30px;">
      <h2>Araç Bazlı Parça Geçmişi</h2>

      ${araclar
  .filter(arac => {
    const kayitlar = aracGecmisi[arac] || []

    return kayitlar.some(kayit => {
      const baslangic = baslangicTarihi
      const bitis = bitisTarihi

      if (!baslangic && !bitis) return true

      const tarihParca = kayit.tarih.split(' ')[0]
      const [gun, ay, yil] = tarihParca.split('.')
      const kayitTarihi = `${yil}-${ay}-${gun}`

      if (baslangic && kayitTarihi < baslangic) return false
      if (bitis && kayitTarihi > bitis) return false

      return true
    })
  })
  .map(arac => `
        <div style="margin-top:20px; padding:15px; background:#f9fafb; border-radius:12px;">
          <h3>
            ${arac}
            <button class="small-btn danger" onclick="aracSil('${arac}')">Sil</button>
          </h3>

          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Ürün</th>
                <th>Miktar</th>
                <th>İşlem</th>
              </tr>
            </thead>

            <tbody>
              ${(aracGecmisi[arac] || [])
  .filter(kayit => {
    const baslangic = document.querySelector('#baslangicTarihi')?.value
    const bitis = document.querySelector('#bitisTarihi')?.value

    if (!baslangic && !bitis) return true

    const tarihParca = kayit.tarih.split(' ')[0]
    const [gun, ay, yil] = tarihParca.split('.')
    const kayitTarihi = `${yil}-${ay}-${gun}`

    if (baslangic && kayitTarihi < baslangic) return false
    if (bitis && kayitTarihi > bitis) return false

    return true
  })
  .map(kayit => `
                <tr>
                  <td>${kayit.tarih}</td>
                  <td>${kayit.urun}</td>
                  <td>${kayit.miktar}</td>
                  <td>
                    <button 
                      class="small-btn danger" 
                      onclick="aracGecmisSil('${arac}', '${kayit.tarih}')"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>
  `
}

function tedarikcilerSayfasi() {
  return `
    <h1>Tedarikçiler</h1>

    <div class="card" style="margin-top:30px;">
      <h2>Yeni Tedarikçi Ekle</h2>

      <div class="form-grid">
        <input id="tedarikciAdi" placeholder="Tedarikçi adı yazın">
        <button id="tedarikciEkleBtn">Tedarikçi Ekle</button>
      </div>
    </div>

    <div class="card" style="margin-top:30px;">
      <h2>Tedarikçi Listesi ve Geçmişi</h2>

      ${tedarikciler.map(tedarikci => `
        <div style="margin-top:20px; padding:15px; background:#f9fafb; border-radius:12px;">
          <h3>
            ${tedarikci}
            <button class="small-btn danger" onclick="tedarikciSil('${tedarikci}')">Sil</button>
          </h3>

          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Ürün</th>
                <th>Miktar</th>
                <th>İşlem</th>
              </tr>
            </thead>

            <tbody>
              ${(tedarikciGecmisi[tedarikci] || []).map(kayit => `
                <tr>
                  <td>${kayit.tarih}</td>
                  <td>${kayit.urun}</td>
                  <td>${kayit.miktar}</td>
                  <td>
                    <button 
                      class="small-btn danger" 
                      onclick="tedarikciGecmisSil('${tedarikci}', '${kayit.tarih}')"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')}
    </div>
  `
}

function raporlarSayfasi() {
  const kritikUrunler = stoklar.filter(item => item.stok <= item.min)

  return `
    <h1>Raporlar</h1>

    <button class="small-btn" onclick="window.print()" style="margin-bottom:20px;">
      PDF / Yazdır
    </button>

    <div class="card" style="margin-top:20px;">
      <h2>Genel Özet</h2>
      <p>Toplam ürün: ${stoklar.length}</p>
      <p>Kritik ürün: ${kritikUrunler.length}</p>
      <p>Toplam araç: ${araclar.length}</p>
      <p>Toplam tedarikçi: ${tedarikciler.length}</p>
      <p>Toplam işlem: ${islemler.length}</p>
    </div>

    <div class="card" style="margin-top:20px;">
      <h2>Kritik Stok Raporu</h2>
      ${
        kritikUrunler.length > 0
          ? kritikUrunler.map(item => `
              <p>${item.urun} - ${item.marka || '-'} - ${item.parcaKodu || '-'} → ${item.stok} adet</p>
            `).join('')
          : '<p>Kritik stok yok</p>'
      }
    </div>

    <div class="card" style="margin-top:20px;">
      <h2>Son 10 İşlem</h2>

      <table>
        <thead>
          <tr>
            <th>Tarih</th>
            <th>İşlem</th>
            <th>Ürün</th>
            <th>Miktar</th>
            <th>Detay</th>
          </tr>
        </thead>

        <tbody>
          ${islemler.slice(0, 10).map(islem => `
            <tr>
              <td>${islem.tarih}</td>
              <td>${islem.tur}</td>
              <td>${islem.urun}</td>
              <td>${islem.miktar}</td>
              <td>${islem.detay}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="card" style="margin-top:20px;">
      <h2>Tedarikçi Özeti</h2>
      ${
        tedarikciler.map(tedarikci => `
          <p>${tedarikci} → ${(tedarikciGecmisi[tedarikci] || []).length} işlem</p>
        `).join('')
      }
    </div>
  `
}

function sayfaIcerigi() {
  if (aktifSayfa === 'dashboard') return dashboardSayfasi()
  if (aktifSayfa === 'stok') return stokSayfasi()
  if (aktifSayfa === 'araclar') return araclarSayfasi()
  if (aktifSayfa === 'tedarikciler') return tedarikcilerSayfasi()
  if (aktifSayfa === 'raporlar') return raporlarSayfasi()
  return dashboardSayfasi()
}

function ekraniCiz() {
  if (!girisYapildi) {
  document.querySelector('#app').innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#111827;
      font-family:Arial;
    ">
      <div style="
        background:white;
        padding:35px;
        border-radius:20px;
        width:360px;
        box-shadow:0 10px 30px rgba(0,0,0,0.25);
        text-align:center;
      ">
        <h2>ÇETİN BETON PANEL</h2>
        <p style="color:#6b7280;">Giriş yapmak için şifreyi yazın</p>

        <input 
  id="kullaniciInput" 
  placeholder="Kullanıcı adı"
  style="
    width:100%;
    padding:12px;
    margin-top:15px;
    border:1px solid #d1d5db;
    border-radius:10px;
    box-sizing:border-box;
  "
>
        <input 
          id="sifreInput" 
          type="password" 
          placeholder="Şifre"
          style="
            width:100%;
            padding:12px;
            margin-top:15px;
            border:1px solid #d1d5db;
            border-radius:10px;
            box-sizing:border-box;
          "
        >

        <button 
          id="girisBtn"
          style="
            width:100%;
            padding:12px;
            margin-top:15px;
          "
        >
          Giriş Yap
        </button>
      </div>
    </div>
  `

  document.querySelector('#girisBtn').addEventListener('click', () => {
   const kullaniciAdi = document.querySelector('#kullaniciInput').value.trim()
const sifre = document.querySelector('#sifreInput').value.trim()

const kullanici = KULLANICILAR.find(
  item => item.kullaniciAdi === kullaniciAdi && item.sifre === sifre
)

if (kullanici) {
  girisYapildi = true
  aktifKullanici = kullanici.kullaniciAdi

  localStorage.setItem('girisYapildi', 'true')
  localStorage.setItem('aktifKullanici', aktifKullanici)

  ekraniCiz()
} else {
  alert('Kullanıcı adı veya şifre yanlış')
}
  })

  return
}
  document.querySelector('#app').innerHTML = `
    <div id="anaLayout" style="display:flex; min-height:100vh;">
      ${menu()}

      <div style="flex:1; padding:30px; background:#eef2f7;">
        ${sayfaIcerigi()}
      </div>
    </div>
  `

  const urunEkleBtn = document.querySelector('#urunEkleBtn')
  const aramaKutusu = document.querySelector('#aramaKutusu')
  const tedarikciEkleBtn = document.querySelector('#tedarikciEkleBtn')
  const aracEkleBtn = document.querySelector('#aracEkleBtn')

  if (aramaKutusu) {
    aramaKutusu.addEventListener('input', (e) => {
      aramaMetni = e.target.value

      const satirlar = document.querySelectorAll('#stokTablosu tr')

      satirlar.forEach(satir => {
        const yazi = satir.innerText.toLowerCase()

        if (yazi.includes(aramaMetni.toLowerCase())) {
          satir.style.display = ''
        } else {
          satir.style.display = 'none'
        }
      })
    })
  }

  if (urunEkleBtn) {
    urunEkleBtn.addEventListener('click', () => {
      const urun = document.querySelector('#urun').value.trim()
      const marka = document.querySelector('#marka').value.trim()
      const parcaKodu = document.querySelector('#parcaKodu').value.trim()
      const kategori = document.querySelector('#kategori').value.trim()
      const stok = Number(document.querySelector('#stok').value)
      const min = Number(document.querySelector('#min').value)

      if (!urun || !kategori || stok <= 0 || min < 0) {
        alert('Lütfen tüm alanları doğru doldurun')
        return
      }

      const tedarikci = prompt('Tedarikçi adı:', tedarikciler[0])
      if (!tedarikci) return

      if (!tedarikciGecmisi[tedarikci]) {
        tedarikciGecmisi[tedarikci] = []
      }

      tedarikciGecmisi[tedarikci].unshift({
        tarih: new Date().toLocaleString('tr-TR'),
        urun: urun,
        miktar: stok
      })

      stoklar.push({ urun, marka, parcaKodu, kategori, stok, min })

      islemler.unshift({
        tarih: new Date().toLocaleString('tr-TR'),
        tur: 'Yeni Ürün Giriş',
        urun: urun,
        miktar: stok,
        detay: tedarikci
      })

      kaydet()
      ekraniCiz()
    })
  }

  if (tedarikciEkleBtn) {
    tedarikciEkleBtn.addEventListener('click', () => {
      const tedarikciAdi = document.querySelector('#tedarikciAdi').value.trim()

      if (!tedarikciAdi) {
        alert('Tedarikçi adı yazın')
        return
      }

      tedarikciler.push(tedarikciAdi)

      if (!tedarikciGecmisi[tedarikciAdi]) {
        tedarikciGecmisi[tedarikciAdi] = []
      }

      kaydet()
      ekraniCiz()
    })
  }

  if (aracEkleBtn) {
    aracEkleBtn.addEventListener('click', () => {
      const aracAdi = document.querySelector('#aracAdi').value.trim()

      if (!aracAdi) {
        alert('Araç bilgisi yazın')
        return
      }

      araclar.push(aracAdi)

      if (!aracGecmisi[aracAdi]) {
        aracGecmisi[aracAdi] = []
      }

      kaydet()
      ekraniCiz()
    })
  }
}

window.sayfaDegistir = function(sayfa) {
  aktifSayfa = sayfa
  ekraniCiz()
}

window.stokGiris = function(index) {
  const miktar = Number(prompt('Kaç adet giriş yapılacak?'))
  if (!miktar || miktar <= 0) return

  const tedarikci = prompt('Tedarikçi adı:', tedarikciler[0])
  if (!tedarikci) return

  stoklar[index].stok += miktar

  if (!tedarikciGecmisi[tedarikci]) {
    tedarikciGecmisi[tedarikci] = []
  }

  tedarikciGecmisi[tedarikci].unshift({
    tarih: new Date().toLocaleString('tr-TR'),
    urun: stoklar[index].urun,
    miktar: miktar
  })

  islemler.unshift({
    tarih: new Date().toLocaleString('tr-TR'),
    tur: 'Stok Giriş',
    urun: stoklar[index].urun,
    miktar: miktar,
    detay: tedarikci
  })

  kaydet()
  ekraniCiz()
}

window.stokCikis = function(index) {
  const miktar = Number(prompt('Kaç adet çıkış yapılacak?'))
  if (!miktar || miktar <= 0) return

  if (miktar > stoklar[index].stok) {
    alert('Stokta yeterli ürün yok')
    return
  }

  const arac = prompt('Hangi araca verildi?', araclar[0])
  if (!arac) return

  stoklar[index].stok -= miktar

  if (!aracGecmisi[arac]) {
    aracGecmisi[arac] = []
  }

  aracGecmisi[arac].unshift({
    tarih: new Date().toLocaleString('tr-TR'),
    urun: stoklar[index].urun,
    miktar: miktar
  })

  islemler.unshift({
    tarih: new Date().toLocaleString('tr-TR'),
    tur: 'Stok Çıkış',
    urun: stoklar[index].urun,
    miktar: miktar,
    detay: arac
  })

  kaydet()
  ekraniCiz()
}

window.urunSil = function(urunAdi) {
  const onay = confirm(urunAdi + ' ürününü silmek istediğinize emin misiniz?')
  if (!onay) return

  stoklar = stoklar.filter(item => item.urun !== urunAdi)

  kaydet()
  ekraniCiz()
}

window.urunDuzenle = function(urunAdi) {
  const urun = stoklar.find(item => item.urun === urunAdi)
  if (!urun) return

  const yeniAd = prompt('Ürün adı:', urun.urun)
  if (!yeniAd) return

  const yeniMarka = prompt('Marka:', urun.marka || '')
  if (yeniMarka === null) return

  const yeniParcaKodu = prompt('Parça kodu:', urun.parcaKodu || '')
  if (yeniParcaKodu === null) return

  const yeniKategori = prompt('Kategori:', urun.kategori)
  if (!yeniKategori) return

  const yeniStok = Number(prompt('Stok miktarı:', urun.stok))
  if (yeniStok < 0 || isNaN(yeniStok)) return

  const yeniMin = Number(prompt('Minimum stok:', urun.min))
  if (yeniMin < 0 || isNaN(yeniMin)) return

  urun.urun = yeniAd
  urun.marka = yeniMarka
  urun.parcaKodu = yeniParcaKodu
  urun.kategori = yeniKategori
  urun.stok = yeniStok
  urun.min = yeniMin

  kaydet()
  ekraniCiz()
}

window.tedarikciSil = function(tedarikciAdi) {
  const onay = confirm(tedarikciAdi + ' tedarikçisini silmek istediğinize emin misiniz?')
  if (!onay) return

  tedarikciler = tedarikciler.filter(item => item !== tedarikciAdi)
  delete tedarikciGecmisi[tedarikciAdi]

  kaydet()
  ekraniCiz()
}

window.aracSil = function(aracAdi) {
  const onay = confirm(aracAdi + ' aracını silmek istediğinize emin misiniz?')
  if (!onay) return

  araclar = araclar.filter(item => item !== aracAdi)
  delete aracGecmisi[aracAdi]

  kaydet()
  ekraniCiz()
}

window.aracGecmisSil = function(aracAdi, tarih) {
  const onay = confirm('Bu araç kaydını silmek istediğinize emin misiniz? Silinirse ürün stoğa geri eklenecek.')
  if (!onay) return

  const kayit = aracGecmisi[aracAdi].find(item => item.tarih === tarih)
  if (!kayit) return

  const urun = stoklar.find(item => item.urun === kayit.urun)

  if (urun) {
    urun.stok += Number(kayit.miktar)
  }

  aracGecmisi[aracAdi] = aracGecmisi[aracAdi].filter(
    item => item.tarih !== tarih
  )

  kaydet()
  ekraniCiz()
}

window.tedarikciGecmisSil = function(tedarikciAdi, tarih) {
  const onay = confirm('Bu tedarikçi giriş kaydını silmek istediğinize emin misiniz? Silinirse ürün stoğundan da düşülecek.')
  if (!onay) return

  const kayit = tedarikciGecmisi[tedarikciAdi].find(item => item.tarih === tarih)
  if (!kayit) return

  const urun = stoklar.find(item => item.urun === kayit.urun)

  if (urun) {
    if (urun.stok < Number(kayit.miktar)) {
      alert('Bu kayıt silinemez. Çünkü stokta düşülecek kadar ürün yok.')
      return
    }

    urun.stok -= Number(kayit.miktar)
  }

  tedarikciGecmisi[tedarikciAdi] = tedarikciGecmisi[tedarikciAdi].filter(
    item => item.tarih !== tarih
  )

  kaydet()
  ekraniCiz()
}
window.tarihFiltresiUygula = function() {
  baslangicTarihi = document.querySelector('#baslangicTarihi').value
  bitisTarihi = document.querySelector('#bitisTarihi').value
  ekraniCiz()
}
window.cikisYap = function() {
  girisYapildi = false
  aktifKullanici = ''

  localStorage.removeItem('girisYapildi')
  localStorage.removeItem('aktifKullanici')

  ekraniCiz()
}
verileriYukle()