import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  Star,
  ArrowLeft,
  Camera,
  Music,
  Building2,
  Utensils,
  Flower2,
  Mic2,
  Car,
  Cake,
  ChevronRight,
  X,
  Euro,
} from 'lucide-react';

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { categoryData } from '../utils/categoryData';

// ======================================================
// PALETA BOJA
// ======================================================

const COLORS = {
  bg: '#E8EEE9',
  cardBg: '#F7F8F4',

  // Tamna kadulja
  heroBg: '#537362',

  // Svijetla kadulja
  inputBg: '#F0F4F0',
  accentBg: '#DCE8DF',

  // Lavanda
  highlightBg: '#E6E3F3',

  primary: '#628971',
  primaryHover: '#4D6E5A',

  secondary: '#8B89B8',
  secondaryHover: '#706EA0',

  textDark: '#29332F',
  textMuted: '#5D6863',
  textLight: '#7D8882',

  border: '#CDD9D1',
};

// ======================================================
// BOJE KARTICA
// ======================================================

const GREEN_CARD = {
  bg: '#DCE8DF',
  iconBg: '#C8DCCE',
  icon: '#537362',
};

const PURPLE_CARD = {
  bg: '#E6E3F3',
  iconBg: '#D7D3EA',
  icon: '#706EA0',
};

// ======================================================
// KATEGORIJE
// ======================================================

const CATEGORIES = [
  {
    slug: 'fotografi',
    label: 'Fotografi i snimatelji',
    Icon: Camera,
  },
  {
    slug: 'bendovi',
    label: 'Bendovi & DJ-i',
    Icon: Music,
  },
  {
    slug: 'sale',
    label: 'Sale i prostori',
    Icon: Building2,
  },
  {
    slug: 'catering',
    label: 'Catering i hrana',
    Icon: Utensils,
  },
  {
    slug: 'dekoracije',
    label: 'Dekoracije i cvijeće',
    Icon: Flower2,
  },
  {
    slug: 'voditelji',
    label: 'Voditelji',
    Icon: Mic2,
  },
  {
    slug: 'prijevoz',
    label: 'Prijevoz',
    Icon: Car,
  },
  {
    slug: 'torte',
    label: 'Torte i slatkiši',
    Icon: Cake,
  },
];

// ======================================================
// HELPER FUNKCIJE
// ======================================================

const cleanText = (str) => {
  if (!str) return '';

  return String(str)
    .toLowerCase()
    .trim()
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ');
};

// Pretvara cijenu iz Firestorea u broj.
//
// Primjeri:
// 500          -> 500
// "500"        -> 500
// "Od 500 €"   -> 500
// "500 €"      -> 500
// "Na upit"    -> null
//
const parsePrice = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const text = String(value)
    .replace(',', '.')
    .replace(/[^\d.]/g, '');

  if (!text) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
};

const isCategoryMatch = (dbCategory, slug) => {
  const c1 = cleanText(dbCategory);
  const c2 = cleanText(slug);

  if (!c1 || !c2) return false;

  if (c1 === c2) return true;

  const saleAliases = [
    'sale',
    'prostori i sale za proslave',
    'sale za vjencanja',
    'sale za vjenčanja',
    'sale i prostori',
    'prostor',
  ];

  if (
    saleAliases.some((a) => c1.includes(a)) &&
    saleAliases.some((a) => c2.includes(a))
  ) {
    return true;
  }

  const photoAliases = [
    'fotografi',
    'fotografi i snimatelji',
    'fotografija',
    'fotograf',
    'snimatelji',
  ];

  if (
    photoAliases.some((a) => c1.includes(a)) &&
    photoAliases.some((a) => c2.includes(a))
  ) {
    return true;
  }

  const musicAliases = [
    'bendovi',
    'bendovi & dj-i',
    'glazba',
    'dj',
    'bend',
  ];

  if (
    musicAliases.some((a) => c1.includes(a)) &&
    musicAliases.some((a) => c2.includes(a))
  ) {
    return true;
  }

  return c1.includes(c2) || c2.includes(c1);
};

// ======================================================
// SERVICES
// ======================================================

export default function Services() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL parametri
  const categoryParam = searchParams.get('category') || '';
  const whereParam = searchParams.get('where') || '';
  const priceFromParam =
    searchParams.get('priceFrom') || '';
  const priceToParam =
    searchParams.get('priceTo') || '';

  // Filter state
  const [category, setCategory] =
    useState(categoryParam);

  const [where, setWhere] =
    useState(whereParam);

  const [priceFrom, setPriceFrom] =
    useState(priceFromParam);

  const [priceTo, setPriceTo] =
    useState(priceToParam);

  const [dbProviders, setDbProviders] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ======================================================
  // SYNC FILTERA S URL-OM
  // ======================================================

  useEffect(() => {
    setCategory(categoryParam);
    setWhere(whereParam);
    setPriceFrom(priceFromParam);
    setPriceTo(priceToParam);
  }, [
    categoryParam,
    whereParam,
    priceFromParam,
    priceToParam,
  ]);

  // ======================================================
  // FIREBASE PROVIDERS
  // ======================================================

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, 'providers')
        );

        const list = [];

        querySnapshot.forEach((docSnap) => {
          const p = docSnap.data();

          const cat =
            p.category ||
            p.categoryName ||
            p.kategorija ||
            p.type ||
            '';

          // Originalna vrijednost cijene
          const rawPrice =
            p.basePrice ??
            p.price ??
            null;

          // Brojčana vrijednost za filtriranje
          const numericPrice =
            parsePrice(rawPrice);

          list.push({
            id: docSnap.id,

            name:
              p.businessName ||
              p.providerName ||
              p.name ||
              'Pružatelj usluga',

            category: cat,

            location:
              p.location ||
              p.city ||
              'Hrvatska',

            price:
              rawPrice !== null &&
              rawPrice !== undefined &&
              rawPrice !== ''
                ? `Od ${rawPrice} €`
                : 'Na upit',

            numericPrice,

            rating: p.rating || 4.8,

            reviewsCount:
              p.reviewsCount ??
              p.reviewCount ??
              0,

            desc:
              p.desc ||
              p.description ||
              'Profesionalne usluge.',

            img:
              p.image ||
              p.img ||
              (p.images &&
              p.images.length > 0
                ? p.images[0]
                : null) ||
              'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
          });
        });

        setDbProviders(list);
      } catch (err) {
        console.error(
          "Greška pri dohvaćanju 'providers':",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // ======================================================
  // SVI PROVIDERI
  // ======================================================

  const allProviders = useMemo(() => {
    const staticList =
      Object.entries(categoryData).flatMap(
        ([catKey, catVal]) =>
          (catVal.providers || []).map((p) => {
            const rawPrice =
              p.basePrice ??
              p.price ??
              null;

            return {
              ...p,

              categoryKey: catKey,

              categoryLabel: catVal.label,

              reviewsCount:
                p.reviewsCount ??
                (Array.isArray(p.reviews)
                  ? p.reviews.length
                  : 0),

              img:
                p.img ||
                'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',

              numericPrice:
                p.numericPrice ??
                parsePrice(rawPrice),
            };
          })
      );

    const firebaseList =
      dbProviders.map((p) => {
        const matchedCat =
          CATEGORIES.find((c) =>
            isCategoryMatch(
              p.category,
              c.slug
            )
          );

        return {
          ...p,

          categoryKey: matchedCat
            ? matchedCat.slug
            : p.category,

          categoryLabel: matchedCat
            ? matchedCat.label
            : p.category,
        };
      });

    return [
      ...staticList,
      ...firebaseList,
    ];
  }, [dbProviders]);

  // ======================================================
  // BROJ PROVIDERA
  // ======================================================

  const getCategoryCount = (slug) => {
    return allProviders.filter(
      (p) =>
        isCategoryMatch(
          p.categoryKey,
          slug
        ) ||
        isCategoryMatch(
          p.category,
          slug
        )
    ).length;
  };

  // ======================================================
  // AKTIVNO PRETRAŽIVANJE
  // ======================================================

  const isSearching = Boolean(
    categoryParam ||
    whereParam ||
    priceFromParam ||
    priceToParam
  );

  // ======================================================
  // FILTRIRANI PROVIDERI
  // ======================================================

  const filteredProviders = useMemo(() => {
    const minPrice =
      priceFromParam !== ''
        ? Number(priceFromParam)
        : null;

    const maxPrice =
      priceToParam !== ''
        ? Number(priceToParam)
        : null;

    return allProviders.filter(
      (provider) => {
        // ------------------------------------------
        // KATEGORIJA
        // ------------------------------------------

        const matchesCategory =
          categoryParam
            ? isCategoryMatch(
                provider.categoryKey,
                categoryParam
              ) ||
              isCategoryMatch(
                provider.category,
                categoryParam
              )
            : true;

        // ------------------------------------------
        // LOKACIJA
        // ------------------------------------------

        const matchesWhere =
          whereParam
            ? cleanText(
                provider.location
              ).includes(
                cleanText(whereParam)
              )
            : true;

        // ------------------------------------------
        // CIJENA
        // ------------------------------------------

        let matchesPrice = true;

        if (
          minPrice !== null ||
          maxPrice !== null
        ) {
          // Ako korisnik filtrira po cijeni,
          // provider mora imati definiranu cijenu.
          if (
            provider.numericPrice === null ||
            provider.numericPrice === undefined
          ) {
            matchesPrice = false;
          } else {
            if (
              minPrice !== null &&
              provider.numericPrice <
                minPrice
            ) {
              matchesPrice = false;
            }

            if (
              maxPrice !== null &&
              provider.numericPrice >
                maxPrice
            ) {
              matchesPrice = false;
            }
          }
        }

        return (
          matchesCategory &&
          matchesWhere &&
          matchesPrice
        );
      }
    );
  }, [
    allProviders,
    categoryParam,
    whereParam,
    priceFromParam,
    priceToParam,
  ]);

  // ======================================================
  // SUBMIT FILTERA
  // ======================================================

  const handleFilterSubmit = (e) => {
    e.preventDefault();

    const params = {};

    if (category) {
      params.category = category;
    }

    if (where) {
      params.where = where;
    }

    if (
      priceFrom !== '' &&
      Number(priceFrom) >= 0
    ) {
      params.priceFrom = priceFrom;
    }

    if (
      priceTo !== '' &&
      Number(priceTo) >= 0
    ) {
      params.priceTo = priceTo;
    }

    setSearchParams(params);
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: COLORS.bg,
        color: COLORS.textDark,
      }}
    >
      {/* ==================================================
          HERO
      ================================================== */}

      <section
        className="relative overflow-hidden px-4 sm:px-8 py-12 sm:py-16"
        style={{
          background: COLORS.heroBg,
        }}
      >
        {/* Dekorativni ljubičasti krug */}

        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
          style={{
            background: '#B9B5D9',
          }}
        />

        {/* Dekorativni bijeli krug */}

        <div
          className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full opacity-10"
          style={{
            background: '#FFFFFF',
          }}
        />

        <div className="relative max-w-7xl mx-auto">
          {/* NASLOV */}

          <div className="max-w-2xl mb-8">
            <span
              className="inline-flex items-center px-3 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest mb-4"
              style={{
                background:
                  'rgba(230, 227, 243, 0.18)',
                color: '#E8E5F5',
                border:
                  '1px solid rgba(255,255,255,0.12)',
              }}
            >
              Sve na jednom mjestu
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
              {isSearching
                ? 'Rezultati pretraživanja'
                : 'Pronađite uslugu za svoj događaj'}
            </h1>

            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{
                color: '#DDE9E1',
              }}
            >
              {isSearching
                ? `Pronađeno ${filteredProviders.length} pružatelja usluga`
                : 'Pronađite savršenog pružatelja usluge za vaš poseban trenutak.'}
            </p>
          </div>

          {/* ==================================================
              FILTER
          ================================================== */}

          <form
            onSubmit={handleFilterSubmit}
            className="w-full"
          >
            <div
              className="rounded-[28px] p-2 sm:p-3 flex flex-col lg:flex-row gap-2 shadow-2xl"
              style={{
                background: '#F5F7F3',
                border:
                  '1px solid rgba(255,255,255,0.25)',
              }}
            >
              {/* ------------------------------------------
                  KATEGORIJA
              ------------------------------------------ */}

              <div
                className="flex items-center gap-3 flex-1 px-4 py-3 rounded-2xl"
                style={{
                  background:
                    COLORS.inputBg,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      COLORS.accentBg,
                    color:
                      COLORS.primary,
                  }}
                >
                  <Search size={17} />
                </div>

                <div className="w-full">
                  <p
                    className="text-[0.6rem] font-bold uppercase tracking-widest mb-0.5"
                    style={{
                      color:
                        COLORS.textLight,
                    }}
                  >
                    Kategorija
                  </p>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value
                      )
                    }
                    className="w-full border-none outline-none text-sm font-semibold bg-transparent cursor-pointer"
                    style={{
                      color:
                        COLORS.textDark,
                    }}
                  >
                    <option value="">
                      Sve kategorije
                    </option>

                    {CATEGORIES.map(
                      (cat) => (
                        <option
                          key={cat.slug}
                          value={cat.slug}
                        >
                          {cat.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>

              {/* ------------------------------------------
                  LOKACIJA
              ------------------------------------------ */}

              <div
                className="flex items-center gap-3 flex-1 px-4 py-3 rounded-2xl"
                style={{
                  background:
                    COLORS.inputBg,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      COLORS.highlightBg,
                    color:
                      COLORS.secondaryHover,
                  }}
                >
                  <MapPin size={17} />
                </div>

                <div className="w-full">
                  <p
                    className="text-[0.6rem] font-bold uppercase tracking-widest mb-0.5"
                    style={{
                      color:
                        COLORS.textLight,
                    }}
                  >
                    Lokacija
                  </p>

                  <input
                    type="text"
                    value={where}
                    onChange={(e) =>
                      setWhere(
                        e.target.value
                      )
                    }
                    placeholder="Grad ili regija"
                    className="w-full border-none outline-none text-sm font-semibold bg-transparent"
                    style={{
                      color:
                        COLORS.textDark,
                    }}
                  />
                </div>

                {where && (
                  <button
                    type="button"
                    onClick={() =>
                      setWhere('')
                    }
                    className="border-none cursor-pointer bg-transparent"
                    style={{
                      color:
                        COLORS.textLight,
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* ------------------------------------------
                  CIJENA OD
              ------------------------------------------ */}

              <div
                className="flex items-center gap-3 flex-1 px-4 py-3 rounded-2xl"
                style={{
                  background:
                    COLORS.inputBg,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      COLORS.accentBg,
                    color:
                      COLORS.primary,
                  }}
                >
                  <Euro size={17} />
                </div>

                <div className="w-full">
                  <p
                    className="text-[0.6rem] font-bold uppercase tracking-widest mb-0.5"
                    style={{
                      color:
                        COLORS.textLight,
                    }}
                  >
                    Cijena od
                  </p>

                  <input
                    type="number"
                    min="0"
                    value={priceFrom}
                    onChange={(e) =>
                      setPriceFrom(
                        e.target.value
                      )
                    }
                    placeholder="0 €"
                    className="w-full border-none outline-none text-sm font-semibold bg-transparent"
                    style={{
                      color:
                        COLORS.textDark,
                    }}
                  />
                </div>
              </div>

              {/* ------------------------------------------
                  CIJENA DO
              ------------------------------------------ */}

              <div
                className="flex items-center gap-3 flex-1 px-4 py-3 rounded-2xl"
                style={{
                  background:
                    COLORS.inputBg,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background:
                      COLORS.highlightBg,
                    color:
                      COLORS.secondaryHover,
                  }}
                >
                  <Euro size={17} />
                </div>

                <div className="w-full">
                  <p
                    className="text-[0.6rem] font-bold uppercase tracking-widest mb-0.5"
                    style={{
                      color:
                        COLORS.textLight,
                    }}
                  >
                    Cijena do
                  </p>

                  <input
                    type="number"
                    min="0"
                    value={priceTo}
                    onChange={(e) =>
                      setPriceTo(
                        e.target.value
                      )
                    }
                    placeholder="∞"
                    className="w-full border-none outline-none text-sm font-semibold bg-transparent"
                    style={{
                      color:
                        COLORS.textDark,
                    }}
                  />
                </div>
              </div>

              {/* ------------------------------------------
                  PRETRAŽI
              ------------------------------------------ */}

              <button
                type="submit"
                className="lg:w-auto px-7 py-4 text-white font-bold text-sm rounded-2xl transition-all duration-300 shadow-md hover:-translate-y-0.5 hover:shadow-lg border-none cursor-pointer"
                style={{
                  background:
                    COLORS.primary,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    COLORS.primaryHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    COLORS.primary)
                }
              >
                Pretraži
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ==================================================
          SADRŽAJ
      ================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-12 w-full flex-1">
        {loading ? (
          /* ==================================================
             LOADING
          ================================================== */

          <div
            className="text-center py-24 rounded-[30px]"
            style={{
              background:
                COLORS.cardBg,
              border:
                `1px solid ${COLORS.border}`,
              boxShadow:
                '0 10px 30px rgba(83, 115, 98, 0.06)',
            }}
          >
            <div
              className="inline-block animate-spin rounded-full h-9 w-9 border-4 border-solid border-r-transparent mb-4"
              style={{
                borderColor:
                  COLORS.primary,
                borderRightColor:
                  'transparent',
              }}
            />

            <p
              className="text-sm font-semibold"
              style={{
                color:
                  COLORS.textMuted,
              }}
            >
              Učitavanje ponude...
            </p>
          </div>
        ) : isSearching ? (
          /* ==================================================
             REZULTATI
          ================================================== */

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-1"
                  style={{
                    color:
                      COLORS.secondaryHover,
                  }}
                >
                  Pretraživanje
                </p>

                <h2
                  className="text-2xl font-extrabold"
                  style={{
                    color:
                      COLORS.textDark,
                  }}
                >
                  Pružatelji usluga
                </h2>
              </div>

              <button
                onClick={() =>
                  setSearchParams({})
                }
                className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer hover:-translate-x-0.5"
                style={{
                  color:
                    COLORS.secondaryHover,
                  background:
                    COLORS.highlightBg,
                }}
              >
                <ArrowLeft size={15} />
                Prikaži sve kategorije
              </button>
            </div>

            {filteredProviders.length >
            0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProviders.map(
                  (provider, index) => {
                    // Provider kartice također
                    // izmjenjuju kadulju i lavandu.

                    const isLavender =
                      index % 2 === 1;

                    return (
                      <div
                        key={provider.id}
                        className="group rounded-[30px] p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between overflow-hidden"
                        style={{
                          background:
                            isLavender
                              ? '#F2F0F8'
                              : '#F4F7F3',

                          border:
                            `1px solid ${COLORS.border}`,

                          boxShadow:
                            '0 8px 25px rgba(83, 115, 98, 0.07)',
                        }}
                      >
                        <div>
                          {/* SLIKA */}

                          <div
                            className="relative w-full h-56 rounded-[22px] overflow-hidden mb-5"
                            style={{
                              background:
                                COLORS.inputBg,
                            }}
                          >
                            <img
                              src={
                                provider.img
                              }
                              alt={
                                provider.name
                              }
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />

                            <div
                              className="absolute inset-0 opacity-20"
                              style={{
                                background:
                                  'linear-gradient(to top, rgba(41,51,47,0.65), transparent 50%)',
                              }}
                            />

                            {/* BADGE */}

                            <span
                              className="absolute top-3 left-3 text-white text-[0.62rem] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider backdrop-blur-md shadow-sm"
                              style={{
                                background:
                                  isLavender
                                    ? 'rgba(112, 110, 160, 0.94)'
                                    : 'rgba(83, 115, 98, 0.94)',
                              }}
                            >
                              {
                                provider.categoryLabel
                              }
                            </span>
                          </div>

                          {/* NAZIV + RATING */}

                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <h2
                                className="text-lg sm:text-xl font-extrabold leading-snug"
                                style={{
                                  color:
                                    COLORS.textDark,
                                }}
                              >
                                {
                                  provider.name
                                }
                              </h2>

                              <p
                                className="text-xs flex items-center gap-1.5 mt-1.5"
                                style={{
                                  color:
                                    COLORS.textMuted,
                                }}
                              >
                                <MapPin
                                  size={14}
                                  style={{
                                    color:
                                      isLavender
                                        ? COLORS.secondary
                                        : COLORS.primary,
                                  }}
                                />

                                {
                                  provider.location
                                }
                              </p>
                            </div>

                            {/* RATING */}

                            <div
                              className="font-extrabold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 shrink-0"
                              style={{
                                background:
                                  isLavender
                                    ? COLORS.highlightBg
                                    : COLORS.accentBg,

                                color:
                                  COLORS.textDark,

                                border:
                                  `1px solid ${COLORS.border}`,
                              }}
                            >
                              <Star
                                size={13}
                                fill={
                                  isLavender
                                    ? COLORS.secondary
                                    : COLORS.primary
                                }
                                style={{
                                  color:
                                    isLavender
                                      ? COLORS.secondary
                                      : COLORS.primary,
                                }}
                              />

                              <span>
                                {provider.rating ||
                                  4.8}
                              </span>
                            </div>
                          </div>

                          {/* OPIS */}

                          <p
                            className="text-xs mt-3 leading-relaxed line-clamp-2"
                            style={{
                              color:
                                COLORS.textMuted,
                            }}
                          >
                            {
                              provider.desc
                            }
                          </p>
                        </div>

                        {/* FOOTER */}

                        <div
                          className="pt-4 mt-5 flex items-center justify-between gap-3"
                          style={{
                            borderTop:
                              `1px solid ${COLORS.border}`,
                          }}
                        >
                          {/* CIJENA */}

                          <span
                            className="text-xs font-bold px-3 py-1.5 rounded-xl"
                            style={{
                              color:
                                COLORS.secondaryHover,
                              background:
                                COLORS.highlightBg,
                            }}
                          >
                            {
                              provider.price
                            }
                          </span>

                          {/* DETALJI */}

                          <Link
                            to={`/services/${provider.categoryKey}/${provider.id}`}
                            className="px-4 py-2.5 text-white text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-1 shadow-sm hover:-translate-y-0.5"
                            style={{
                              background:
                                COLORS.primary,
                              textDecoration:
                                'none',
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                COLORS.primaryHover)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                COLORS.primary)
                            }
                          >
                            Pogledaj detalje

                            <ChevronRight
                              size={14}
                            />
                          </Link>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              /* ==================================================
                 NEMA REZULTATA
              ================================================== */

              <div
                className="text-center py-20 px-4 rounded-[30px]"
                style={{
                  background:
                    COLORS.cardBg,

                  border:
                    `1px solid ${COLORS.border}`,

                  boxShadow:
                    '0 10px 30px rgba(83, 115, 98, 0.06)',
                }}
              >
                <div
                  className="w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      COLORS.highlightBg,
                    color:
                      COLORS.secondaryHover,
                  }}
                >
                  <Search size={27} />
                </div>

                <p
                  className="text-lg font-extrabold"
                  style={{
                    color:
                      COLORS.textDark,
                  }}
                >
                  Nema pronađenih
                  rezultata
                </p>

                <p
                  className="text-xs mt-2"
                  style={{
                    color:
                      COLORS.textMuted,
                  }}
                >
                  Pokušajte promijeniti
                  parametre pretrage.
                </p>

                <button
                  onClick={() =>
                    setSearchParams({})
                  }
                  className="mt-6 px-5 py-2.5 text-white font-bold text-xs rounded-xl transition-all hover:-translate-y-0.5 border-none cursor-pointer"
                  style={{
                    background:
                      COLORS.primary,
                  }}
                >
                  Poništi pretragu
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ==================================================
             KATEGORIJE
          ================================================== */

          <div>
            <div className="mb-8">
              <p
                className="text-xs font-bold uppercase tracking-widest mb-1"
                style={{
                  color:
                    COLORS.secondaryHover,
                }}
              >
                Istražite ponudu
              </p>

              <h2
                className="text-2xl sm:text-3xl font-extrabold"
                style={{
                  color:
                    COLORS.textDark,
                }}
              >
                Kategorije usluga
              </h2>

              <p
                className="text-sm mt-2 max-w-xl"
                style={{
                  color:
                    COLORS.textMuted,
                }}
              >
                Sve što vam treba za
                organizaciju posebnog
                događaja, na jednom
                mjestu.
              </p>
            </div>

            {/* ==================================================
                KATEGORIJE

                UVIJEK:

                🟢 🟣 🟢 🟣
                🟢 🟣 🟢 🟣
                🟢 🟣 ...

                Na mobitelu:

                🟢
                🟣
                🟢
                🟣
                ...
            ================================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {CATEGORIES.map(
                (
                  {
                    slug,
                    label,
                    Icon,
                  },
                  index
                ) => {
                  // Jednostavna izmjena:
                  //
                  // 0 = zelena
                  // 1 = ljubičasta
                  // 2 = zelena
                  // 3 = ljubičasta
                  //
                  // Isto vrijedi na mobitelu,
                  // tabletu i desktopu.

                  const isLavender =
                    index % 2 === 1;

                  const colors =
                    isLavender
                      ? PURPLE_CARD
                      : GREEN_CARD;

                  const count =
                    getCategoryCount(
                      slug
                    );

                  return (
                    <Link
                      key={slug}
                      to={
                        '/services/' +
                        slug
                      }
                      className="group relative rounded-[28px] p-6 min-h-[235px] flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl overflow-hidden"
                      style={{
                        background:
                          colors.bg,

                        border:
                          `1px solid ${COLORS.border}`,

                        textDecoration:
                          'none',

                        boxShadow:
                          '0 8px 25px rgba(83, 115, 98, 0.07)',
                      }}
                    >
                      {/* DEKORATIVNI KRUG */}

                      <div
                        className="absolute -right-10 -top-10 w-28 h-28 rounded-full opacity-40 transition-transform duration-500 group-hover:scale-125"
                        style={{
                          background:
                            colors.iconBg,
                        }}
                      />

                      <div className="relative">
                        {/* IKONA */}

                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-2"
                          style={{
                            background:
                              colors.iconBg,
                            color:
                              colors.icon,
                          }}
                        >
                          <Icon
                            size={26}
                            strokeWidth={2}
                          />
                        </div>

                        {/* NAZIV */}

                        <h2
                          className="font-extrabold text-lg leading-snug pr-3"
                          style={{
                            color:
                              COLORS.textDark,
                          }}
                        >
                          {label}
                        </h2>

                        {/* BROJ */}

                        <p
                          className="text-xs mt-2 font-semibold"
                          style={{
                            color:
                              COLORS.textMuted,
                          }}
                        >
                          {count === 0
                            ? 'Nema pružatelja'
                            : `${count} ${
                                count ===
                                1
                                  ? 'pružatelj'
                                  : 'pružatelja'
                              }`}
                        </p>
                      </div>

                      {/* DONJI DIO */}

                      <div
                        className="relative mt-6 pt-4 flex items-center justify-between text-xs font-bold"
                        style={{
                          borderTop:
                            '1px solid rgba(83, 115, 98, 0.15)',

                          color:
                            colors.icon,
                        }}
                      >
                        <span>
                          Istraži kategoriju
                        </span>

                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 group-hover:translate-x-1"
                          style={{
                            background:
                              colors.iconBg,
                          }}
                        >
                          <ChevronRight
                            size={16}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}