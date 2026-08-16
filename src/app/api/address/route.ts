import { NextResponse } from 'next/server'

const provinces = [
  { name: 'Metro Manila', municipalities: ['Manila', 'Quezon City', 'Makati', 'Pasig', 'Taguig'] },
  { name: 'Cavite', municipalities: ['Bacoor', 'Imus', 'Dasmariñas', 'Tagaytay', 'Cavite City'] },
  { name: 'Laguna', municipalities: ['Santa Cruz', 'Calamba', 'San Pablo', 'Biñan', 'Los Baños'] },
  { name: 'Bulacan', municipalities: ['Malolos', 'Meycauayan', 'San Jose del Monte', 'Baliuag', 'Santa Maria'] },
  { name: 'Rizal', municipalities: ['Antipolo', 'Taytay', 'Angono', 'Cainta', 'Binangonan'] },
  { name: 'Cebu', municipalities: ['Cebu City', 'Lapu-Lapu', 'Mandaue', 'Carcar', 'Bogo'] },
  { name: 'Davao del Sur', municipalities: ['Davao City', 'Panabo', 'Samal', 'Tagum', 'Mati'] },
  { name: 'Iloilo', municipalities: ['Iloilo City', 'Passi', 'Oton', 'Pavia', 'Santa Barbara'] },
  { name: 'Pampanga', municipalities: ['San Fernando', 'Angeles', 'Mabalacat', 'Apalit', 'Lubao'] },
  { name: 'Batangas', municipalities: ['Batangas City', 'Lipa', 'Tanauan', 'Bauan', 'Santo Tomas'] },
]

const barangayData: Record<string, Record<string, string[]>> = {
  'Metro Manila': {
    Manila: ['Binondo', 'Intramuros', 'Quiapo', 'Sampaloc', 'Tondo', 'Ermita', 'Malate', 'Manila Bayarea'],
    'Quezon City': ['Cubao', 'Greenhills', 'Quezon Avenue', 'Diliman', 'Bishan', 'Miriam', 'Timog', 'Glorietta'],
    Makati: ['Bel-Air', 'Buendia', 'Chino Roces', 'Dasmarinas', 'Legazpi', 'Olympia', 'Poblacion', 'Urdaneta'],
    Pasig: ['Ortigas', 'Shaw Boulevard', 'Pasig Proper', 'Pinagbuhatan', 'Ugong', 'Annapolis', 'Bayan-Bayan'],
    Taguig: ['Bonifacio Global City', 'Fort Bonifacio', 'C-5', 'Napico', 'Pembo', 'Comembo', 'Taguig Proper'],
  },
  Cavite: {
    Bacoor: ['Almanza', 'Bucan', 'Daang Barangka', 'Mabolo', 'Minante', 'Poblacion', 'Real', 'Talisay'],
    Imus: ['Anilag-Talim', 'Bagumbayan', 'Bahbuhan', 'Magdalo', 'Magdiwang', 'Marulas', 'Poblacion', 'Townsite'],
    Dasmariñas: ['Batingan', 'Burol', 'Carmen', 'Dahilig', 'Harriot', 'Kumil', 'Mabuhay', 'Poblacion'],
    Tagaytay: ['Asukay', 'Bagong Tubig', 'Bukal', 'Kaybook', 'Neogan', 'Poblacion', 'Sambong', 'Silang'],
    'Cavite City': ['Bambang', 'Bgy 11', 'Bgy 13', 'Fortune Island', 'Igbiwang', 'Ibayo', 'Poblacion', 'Sangley'],
  },
  Laguna: {
    'Santa Cruz': ['Bagumbayan', 'Balitan', 'Bambang', 'Bukal', 'Halocra', 'Imok', 'Maticdula', 'Poblacion'],
    Calamba: ['Bubuyan', 'Dolores', 'Isidro', 'Jasaan', 'Lumangbayan', 'Mabini', 'Poblacion', 'Real'],
    'San Pablo': ['Aguado', 'Aguinaldo', 'Bakaran', 'Concepcion', 'Del Pilar', 'Mabini', 'Poblacion', 'San Antonio'],
    Biñan: ['Abungan', 'Bakaran', 'Bancagan', 'Bocutan', 'Dilan', 'Duhat', 'Poblacion', 'Santos'],
    'Los Baños': ['Babylon', 'Bahaghari', 'Bayalin', 'Bunggahan', 'Huwad', 'Lalake', 'Poblacion', 'Tuhod'],
  },
  Bulacan: {
    Malolos: ['Annapolis', 'Babuya', 'Bagong Tambol', 'Balingasan', 'Catmon', 'Guinhawa', 'Poblacion', 'Santol'],
    Meycauayan: ['Allare', 'Baklouk', 'Baytown', 'Caingin', 'Mabini', 'Malhacan', 'Poblacion', 'Santa Cruz'],
    'San Jose del Monte': ['Bagong Silangan', 'Bahay Toro', 'Bancal', 'Culiat', 'Dolores', 'Poblacion', 'Santa Elena', 'Santo Niño'],
    Baliuag: ['Abagatan', 'Bacnung', 'Bahay na Pula', 'Bancal', 'Caingin', 'Poblacion', 'Sambalilo', 'Santo Niño'],
    'Santa Maria': ['Bagumbayan', 'Bambang', 'Bubung', 'Lagundi', 'Mabayuhan', 'Poblacion', 'Santa Cruz', 'Talisay'],
  },
  Rizal: {
    Antipolo: ['Bambang', 'Batingan', 'Cupang', 'Dela Paz', 'Hinulugan', 'Mambog', 'Poblacion', 'Santo Niño'],
    Taytay: ['Bagumbayan', 'Bambang', 'Catmon', 'Dungo', 'Mabini', 'Poblacion', 'Santa Ana', 'Sulivan'],
    Angono: ['Bagumbayan', 'Bilibirasan', 'Kalayaan', 'Mabunga', 'Poblacion', 'Sapa', 'Tuktukan', 'Wawa'],
    Cainta: ['Cainta Proper', 'Dulong Sinio', 'Manggahan', 'Pag-asa', 'Poblacion', 'Prk Riverside', 'Sampaguita', 'Tropical'],
    Binangonan: ['Bakun', 'Bocoran', 'Dulang', 'Inquilir', 'Poblacion', 'Sabang', 'Tabing', 'Tulay'],
  },
  Cebu: {
    'Cebu City': ['Adlaon', 'Basak', 'Bogo', 'Budlaan', 'Cabitawan', 'Dalahican', 'Guadalupe', 'Tisa'],
    'Lapu-Lapu': ['Bankal', 'Basak', 'Buayaan', 'Gunob', 'Maribojoc', 'Poblacion', 'Sabang', 'Tugbuna'],
    Mandaue: ['Alumbreras', 'Basak', 'Bogo', 'Centro', 'Guadalupe', 'Lamitan', 'Poblacion', 'Suba'],
    Carcar: ['Alcoy', 'Bokaw', 'Cagmay', 'Dancat', 'Poblacion', 'Sagot', 'Tumagoc', 'Ubong'],
    Bogo: ['Bakasan', 'Basak', 'Bobon', 'Danggasan', 'Poblacion', 'San Isidro', 'Tangil', 'Tugbuna'],
  },
  'Davao del Sur': {
    'Davao City': ['Alawih-B', 'Bagsakan', 'Boulevard', 'Comunal', 'Dampas', 'Poblacion', 'Sampaguita', 'Tipularan'],
    Panabo: ['Bagong Silangan', 'Bancal', 'Bobon', 'Dapitan', 'Poblacion', 'San Francisco', 'Tigum', 'Tulay'],
    Samal: ['Aguinaldo', 'Baraca', 'Bataan', 'Poblacion', 'Sapangan', 'Tagbaya', 'Tulay', 'Wawa'],
    Tagum: ['Alfonso', 'Bagong Silangan', 'Bancal', 'Davao', 'Poblacion', 'San Antonio', 'Santa Cruz', 'Talisay'],
    Mati: ['Badas', 'Cagang', 'Lungsardo', 'Poblacion', 'San Juan', 'Sangay', 'Tubod', 'Wawa'],
  },
  Iloilo: {
    'Iloilo City': ['Arevalo', 'Balantang', 'Barrias', 'Daore', 'General', 'Poblacion', 'Santa Barbara', 'Taclo'],
    Passi: ['Agpangi', 'Bagangbong', 'Banzon', 'Daga', 'Poblacion', 'Sabang', 'Tigbauan', 'Tubod'],
    Oton: ['Alas', 'Bagong Silangan', 'Bito', 'Daga', 'Poblacion', 'Sabang', 'Tigbauan', 'Tubod'],
    Pavia: ['Alac', 'Bagumbayan', 'Bito', 'Buenos Aires', 'Poblacion', 'Sabang', 'Tugbuna', 'Tubod'],
    'Santa Barbara': ['Anapo', 'Bagumbayan', 'Bito', 'Daga', 'Poblacion', 'Sabang', 'Tugbuna', 'Tubod'],
  },
  Pampanga: {
    'San Fernando': ['Anao', 'Bangkuru', 'Bubuka', 'Capalangan', 'Dita', 'Poblacion', 'Sapa', 'Santo Domingo'],
    Angeles: ['Aguinaldo', 'Bagong Silangan', 'Balibago', 'Capaya', 'Dolores', 'Poblacion', 'Santo Niño', 'Tabac'],
    Mabalacat: ['Anao', 'Babuyan', 'Bagnagan', 'Bubuka', 'Dita', 'Poblacion', 'Sapa', 'Santo Domingo'],
    Apalit: ['Alas', 'Babuyan', 'Dita', 'Poblacion', 'Sampaguita', 'Santo Niño', 'Tabac', 'Tubig'],
    Lubao: ['Anao', 'Babuyan', 'Dita', 'Poblacion', 'Sapa', 'Santo Domingo', 'Tabac', 'Tubig'],
  },
  Batangas: {
    'Batangas City': ['Alitap', 'Bancal', 'Bataan', 'Bulihan', 'Poblacion', 'Santa Ana', 'Santo Niño', 'Tulay'],
    Lipa: ['Alaminos', 'Anilao', 'Bagsakan', 'Capinan', 'Poblacion', 'Santa Luz', 'Santo Niño', 'Tamban'],
    Tanauan: ['Abaga', 'Anilao', 'Bagsakan', 'Bulihan', 'Poblacion', 'Santa Ana', 'Santo Niño', 'Tulay'],
    Bauan: ['Alitap', 'Bancal', 'Bataan', 'Bulihan', 'Poblacion', 'Santa Ana', 'Santo Niño', 'Tulay'],
    'Santo Tomas': ['Alaminos', 'Anilao', 'Bagsakan', 'Capinan', 'Poblacion', 'Santa Luz', 'Santo Niño', 'Tamban'],
  },
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (type === 'provinces') {
    return NextResponse.json({ provinces: provinces.map((p) => p.name) })
  }

  if (type === 'municipalities') {
    const province = searchParams.get('province')
    const provinceData = provinces.find((p) => p.name === province)
    if (!provinceData) {
      return NextResponse.json({ error: 'Province not found' }, { status: 404 })
    }
    return NextResponse.json({ municipalities: provinceData.municipalities })
  }

  if (type === 'barangays') {
    const province = searchParams.get('province')
    const municipality = searchParams.get('municipality')
    if (!province || !municipality) {
      return NextResponse.json({ barangays: [] })
    }
    const barangays = barangayData[province]?.[municipality]
    if (!barangays) {
      return NextResponse.json({ barangays: [] })
    }
    return NextResponse.json({ barangays })
  }

  return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
}
