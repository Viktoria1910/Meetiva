export const categoryData = {
  fotografi: {
    label: 'Fotografi', icon: '📷',
    providers: [
      { id: 1, name: 'Foto Studio Lux',   location: 'Zagreb', price: 'Od 150 €', rating: 4.8, desc: 'Specijaliziran za vjenčanja i portrete.' },
      { id: 2, name: 'Ana Kovač Photo',   location: 'Split',  price: 'Od 120 €', rating: 4.7, desc: 'Reportažni stil, prirodne fotografije.' },
      { id: 3, name: 'Click & Story',     location: 'Rijeka', price: 'Od 180 €', rating: 4.9, desc: 'Storytelling pristup svakom događaju.' },
      { id: 4, name: 'Marko Foto',        location: 'Osijek', price: 'Od 100 €', rating: 4.5, desc: 'Povoljne cijene, profesionalna oprema.' },
    ],
  },
  bendovi: {
    label: 'Bendovi', icon: '🎸',
    providers: [
      { id: 1, name: 'Rhythm Wave',       location: 'Split',  price: 'Od 300 €', rating: 4.9, desc: 'Pop i rock repertoar, 5 članova.' },
      { id: 2, name: 'Acoustic Duo',      location: 'Zagreb', price: 'Od 150 €', rating: 4.6, desc: 'Akustična glazba za intimne proslave.' },
      { id: 3, name: 'Party Band HRV',    location: 'Zadar',  price: 'Od 400 €', rating: 4.8, desc: 'Cijela večer žive glazbe, puno energije.' },
      { id: 4, name: 'Jazz Collective',   location: 'Zagreb', price: 'Od 250 €', rating: 4.7, desc: 'Jazz i soul za elegantne večere.' },
    ],
  },
  dj: {
    label: 'DJ-evi', icon: '🎧',
    providers: [
      { id: 1, name: 'DJ MixMaster',      location: 'Zadar',  price: 'Od 250 €', rating: 4.7, desc: 'Elektronika, house i pop miksevi.' },
      { id: 2, name: 'DJ Sunset',         location: 'Split',  price: 'Od 200 €', rating: 4.6, desc: 'Idealan za ljetne proslave na otvorenom.' },
      { id: 3, name: 'DJ Primo',          location: 'Zagreb', price: 'Od 300 €', rating: 4.9, desc: 'Iskusan DJ s 15+ godina nastupa.' },
    ],
  },
  sale: {
    label: 'Sale i prostori', icon: '🏛️',
    providers: [
      { id: 1, name: 'Crystal Hall',      location: 'Rijeka',          price: 'Od 500 €',  rating: 4.7, desc: 'Elegantna dvorana za 200 gostiju.' },
      { id: 2, name: 'Dvorana Zlatna',    location: 'Zagreb',          price: 'Od 800 €',  rating: 4.8, desc: 'Luksuzni interijer, uključen catering.' },
      { id: 3, name: 'Vinski Podrum',     location: 'Slavonski Brod',  price: 'Od 300 €',  rating: 4.6, desc: 'Rustikalan prostor s vinarijom.' },
      { id: 4, name: 'Garden Estate',     location: 'Dubrovnik',       price: 'Od 1200 €', rating: 5.0, desc: 'Otvoreni vrt s pogledom na more.' },
    ],
  },
  catering: {
    label: 'Catering', icon: '🍽️',
    providers: [
      { id: 1, name: 'Caterino & Co.',    location: 'Zagreb', price: 'Od 20 € / osobi', rating: 4.6, desc: 'Mediteranska i kontinentalna kuhinja.' },
      { id: 2, name: 'Chef On Demand',    location: 'Split',  price: 'Od 25 € / osobi', rating: 4.8, desc: 'Privatni chef dolazi na lokaciju.' },
      { id: 3, name: 'Buffet Masters',    location: 'Osijek', price: 'Od 15 € / osobi', rating: 4.5, desc: 'Bogati buffet za sve vrste proslava.' },
    ],
  },
  dekoracije: {
    label: 'Dekoracije', icon: '🌸',
    providers: [
      { id: 1, name: 'Dekor Botanica',    location: 'Osijek', price: 'Od 200 €', rating: 4.5, desc: 'Cvjetne kompozicije i stolni dekor.' },
      { id: 2, name: 'Magic Decor',       location: 'Zagreb', price: 'Od 350 €', rating: 4.8, desc: 'Kompletno uređenje prostora po mjeri.' },
      { id: 3, name: 'Flower Story',      location: 'Rijeka', price: 'Od 150 €', rating: 4.6, desc: 'Buket, vijenac i sitni ukrasni detalji.' },
    ],
  },
  voditelji: {
    label: 'Voditelji', icon: '🎤',
    providers: [
      { id: 1, name: 'Ivan Perić',        location: 'Zagreb', price: 'Od 300 €', rating: 4.9, desc: 'Voditelj vjenčanja s 10+ godina iskustva.' },
      { id: 2, name: 'Maja Horvat',       location: 'Split',  price: 'Od 250 €', rating: 4.7, desc: 'Zabavna i topla atmosfera na svakom događaju.' },
      { id: 3, name: 'Studio Voice',      location: 'Rijeka', price: 'Od 280 €', rating: 4.8, desc: 'Profesionalna oprema uključena u cijenu.' },
    ],
  },
  prijevoz: {
    label: 'Prijevoz', icon: '🚗',
    providers: [
      { id: 1, name: 'Limo Service HR',   location: 'Zagreb',     price: 'Od 150 €', rating: 4.7, desc: 'Limuzine i premium vozila za posebne prilike.' },
      { id: 2, name: 'Wedding Wheels',    location: 'Split',      price: 'Od 120 €', rating: 4.6, desc: 'Klasični automobili za vjenčanja.' },
      { id: 3, name: 'VIP Transfer',      location: 'Dubrovnik',  price: 'Od 200 €', rating: 4.8, desc: 'Transfer od aerodroma do mjesta vjenčanja.' },
    ],
  },
  torte: {
    label: 'Torte i slatkiši', icon: '🎂',
    providers: [
      { id: 1, name: 'Slastičarnica Luna', location: 'Zagreb', price: 'Od 80 €',  rating: 4.9, desc: 'Višekatne torte po narudžbi, figurice.' },
      { id: 2, name: 'Sweet Dream',        location: 'Split',  price: 'Od 60 €',  rating: 4.7, desc: 'Vjenčane torte i desert bar.' },
      { id: 3, name: 'Cake Art Studio',    location: 'Rijeka', price: 'Od 100 €', rating: 4.8, desc: 'Artistički dizajn, bezglutenski dostupno.' },
      { id: 4, name: 'Pekara Slatko',      location: 'Osijek', price: 'Od 50 €',  rating: 4.5, desc: 'Domaći kolači i mini desert stolovi.' },
    ],
  },
};
