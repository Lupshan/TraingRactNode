import { serializeRLE } from '../engine/rle'

function fromAscii(ascii) {
  return ascii
    .trim()
    .split('\n')
    .map((line) => line.trim().split('').map((char) => char === '#'))
}

// Formes standard (LifeWiki), vérifiées contre notre propre moteur
// (période/déplacement attendu) avant intégration — voir
// src/__tests__/patterns/builtin.test.js.
const RAW_PATTERNS = [
  {
    id: 'glider',
    name: 'Planeur',
    ascii: `
      .#.
      ..#
      ###
    `,
  },
  {
    id: 'blinker',
    name: 'Clignotant',
    ascii: `###`,
  },
  {
    id: 'toad',
    name: 'Crapaud',
    ascii: `
      .###
      ###.
    `,
  },
  {
    id: 'beacon',
    name: 'Phare',
    ascii: `
      ##..
      ##..
      ..##
      ..##
    `,
  },
  {
    id: 'pulsar',
    name: 'Pulsar',
    ascii: `
      ..###...###..
      .............
      #....#.#....#
      #....#.#....#
      #....#.#....#
      ..###...###..
      .............
      ..###...###..
      #....#.#....#
      #....#.#....#
      #....#.#....#
      .............
      ..###...###..
    `,
  },
  {
    id: 'lwss',
    name: 'Vaisseau léger',
    ascii: `
      .####
      #...#
      ....#
      #..#.
    `,
  },
  {
    id: 'block',
    name: 'Bloc',
    ascii: `
      ##
      ##
    `,
  },
  {
    id: 'beehive',
    name: 'Ruche',
    ascii: `
      .##.
      #..#
      .##.
    `,
  },
]

export const BUILTIN_PATTERNS = RAW_PATTERNS.map(({ id, name, ascii }) => ({
  id,
  name,
  rle: serializeRLE(fromAscii(ascii)),
}))
