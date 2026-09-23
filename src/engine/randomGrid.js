// Générateur pseudo-aléatoire seedable (mulberry32) : contrairement à
// Math.random(), son état de départ est explicite et rejouable — même
// seed, même suite de nombres renvoyés, à chaque appel, sur n'importe
// quelle machine.
export function mulberry32(seed) {
  let a = seed >>> 0
  return function rand() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), a | 1)
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Accepte une seed textuelle ("coucou") en plus d'une seed numérique : on
// la hache en un entier 32 bits (algorithme djb2, comme Minecraft le fait
// pour ses seeds non numériques) afin de nourrir mulberry32.
export function hashSeed(input) {
  if (typeof input === 'number' && Number.isFinite(input)) return input >>> 0

  const text = String(input)
  let hash = 5381
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 33) ^ text.charCodeAt(i)
  }
  return hash >>> 0
}

// Ramène le flottant brut [0, 1) de rand() dans un intervalle entier
// [min, max] inclus.
function randomInt(rand, min, max) {
  return min + Math.floor(rand() * (max - min + 1))
}

// Tire un sous-ensemble de {0, ..., maxNeighbors} : chaque nombre de
// voisins a une chance indépendante `probability` d'être inclus. Sert à
// tirer des règles B/S aléatoires (cf. generateRandomGrid2D/3D) — même
// mécanique que le remplissage des cellules (Cas 2 : rand() < seuil), un
// seuil différent par usage (birth vs survive).
function randomNeighborSet(rand, maxNeighbors, probability) {
  const set = new Set()
  for (let n = 0; n <= maxNeighbors; n++) {
    if (rand() < probability) set.add(n)
  }
  return set
}

export const RANDOM_2D_MIN_SIZE = 10
export const RANDOM_2D_MAX_SIZE = 60
export const RANDOM_3D_MIN_SIZE = 6
export const RANDOM_3D_MAX_SIZE = 20

const MAX_NEIGHBORS_2D = 8
const MAX_NEIGHBORS_3D = 26

// Probabilités de tirage des règles aléatoires : la survie a plus de
// chances d'inclure un voisinage donné que la naissance, pour limiter le
// risque de règles qui tuent tout instantanément (pas garanti pour
// autant — l'exploration fait partie du jeu).
const BIRTH_PROBABILITY = 0.25
const SURVIVE_PROBABILITY = 0.35

// Grille 2D reproductible : mêmes dimensions, mêmes cellules et (si
// `randomizeRules`) mêmes règles B/S à chaque appel pour une même seed et
// une même densité — l'ordre des tirages (dimensions, puis règles si
// activées, puis cellules) fait partie de la reproductibilité au même
// titre que la seed elle-même. `density` est la probabilité (0-1) qu'une
// cellule donnée soit vivante.
export function generateRandomGrid2D(seed, density, { randomizeRules = false } = {}) {
  const rand = mulberry32(hashSeed(seed))
  const rows = randomInt(rand, RANDOM_2D_MIN_SIZE, RANDOM_2D_MAX_SIZE)
  const cols = randomInt(rand, RANDOM_2D_MIN_SIZE, RANDOM_2D_MAX_SIZE)
  const rules = randomizeRules
    ? {
        birth: randomNeighborSet(rand, MAX_NEIGHBORS_2D, BIRTH_PROBABILITY),
        survive: randomNeighborSet(rand, MAX_NEIGHBORS_2D, SURVIVE_PROBABILITY),
      }
    : null
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => rand() < density),
  )
  return { rows, cols, grid, rules }
}

// Équivalent 3D : mêmes garanties de reproductibilité, bornes par axe
// plus restreintes (une grille 60x60x60 serait beaucoup trop lourde à
// simuler/rendre).
export function generateRandomGrid3D(seed, density, { randomizeRules = false } = {}) {
  const rand = mulberry32(hashSeed(seed))
  const sizeX = randomInt(rand, RANDOM_3D_MIN_SIZE, RANDOM_3D_MAX_SIZE)
  const sizeY = randomInt(rand, RANDOM_3D_MIN_SIZE, RANDOM_3D_MAX_SIZE)
  const sizeZ = randomInt(rand, RANDOM_3D_MIN_SIZE, RANDOM_3D_MAX_SIZE)
  const rules = randomizeRules
    ? {
        birth: randomNeighborSet(rand, MAX_NEIGHBORS_3D, BIRTH_PROBABILITY),
        survive: randomNeighborSet(rand, MAX_NEIGHBORS_3D, SURVIVE_PROBABILITY),
      }
    : null
  const grid = Array.from({ length: sizeX }, () =>
    Array.from({ length: sizeY }, () =>
      Array.from({ length: sizeZ }, () => rand() < density),
    ),
  )
  return { sizeX, sizeY, sizeZ, grid, rules }
}
