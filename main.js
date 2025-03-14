// Amino acid data with masses and codes
const aminoAcids = {
  // 1-letter code: [3-letter code, mass]
  'A': ['Ala', 71.08],
  'R': ['Arg', 156.19],
  'N': ['Asn', 114.11],
  'D': ['Asp', 115.09],
  'C': ['Cys', 103.15],
  'E': ['Glu', 129.12],
  'Q': ['Gln', 128.13],
  'G': ['Gly', 57.05],
  'H': ['His', 137.14],
  'I': ['Ile', 113.16],
  'L': ['Leu', 113.16],
  'K': ['Lys', 128.17],
  'M': ['Met', 131.19],
  'F': ['Phe', 147.18],
  'P': ['Pro', 97.12],
  'S': ['Ser', 87.08],
  'T': ['Thr', 101.11],
  'W': ['Trp', 186.21],
  'Y': ['Tyr', 163.18],
  'V': ['Val', 99.13]
};

// Create reverse lookup for 3-letter codes
const threeLetter = {};
Object.entries(aminoAcids).forEach(([one, [three, mass]]) => {
  threeLetter[three.toUpperCase()] = [one, mass];
});

// DOM elements
const elements = {
  sequence: document.getElementById('sequence'),
  sequenceMode: document.getElementById('sequenceMode'),
  massSpectrum: document.getElementById('massSpectrum'),
  additionalMass: document.getElementById('additionalMass'),
  maxResults: document.getElementById('maxResults'),
  calculateBtn: document.getElementById('calculate'),
  formattedSequence: document.getElementById('formattedSequence'),
  resultsTable: document.getElementById('resultsTable').querySelector('tbody')
};

// Parse sequence based on mode
function parseSequence(input, mode) {
  input = input.toUpperCase().replace(/[^A-Z]/g, '');
  let result = [];
  
  if (mode === '1') {
      // 1-letter mode
      for (let char of input) {
          if (aminoAcids[char]) {
              result.push(char);
          }
      }
  } else {
      // 3-letter mode
      let buffer = '';
      for (let char of input) {
          buffer += char;
          if (buffer.length === 3) {
              if (threeLetter[buffer]) {
                  result.push(threeLetter[buffer][0]);
                  buffer = '';
              } else {
                  buffer = buffer.substring(1);
              }
          }
      }
  }
  
  return result;
}

// Calculate molar mass of a fragment
function calculateMolarMass(fragment) {
  if (fragment.length === 0) return 0;
  let mass = fragment.reduce((sum, aa) => sum + aminoAcids[aa][1], 0);
  if (fragment.length > 1) {
      mass -= 18 * (fragment.length - 1); // Subtract water mass for peptide bonds
  }
  return Math.round(mass);
}

// Format sequence in 3-letter code
function formatSequence(sequence) {
  return sequence.map(aa => aminoAcids[aa][0]).join('-');
}

// Generate all possible fragments
function generateFragments(sequence) {
  const fragments = new Set();
  for (let i = 0; i < sequence.length; i++) {
      for (let j = i + 1; j <= sequence.length; j++) {
          fragments.add(sequence.slice(i, j).join(''));
      }
  }
  return Array.from(fragments).map(f => f.split(''));
}

// Update results
function updateResults() {
  const sequence = parseSequence(elements.sequence.value, elements.sequenceMode.value);
  const targetMass = parseInt(elements.massSpectrum.value) || 0;
  const additionalMass = parseInt(elements.additionalMass.value) || 0;
  const maxResults = parseInt(elements.maxResults.value) || 10;

  // Display formatted input sequence
  elements.formattedSequence.textContent = formatSequence(sequence);

  // Generate and analyze fragments
  const fragments = generateFragments(sequence);
  const results = fragments.map(fragment => {
      const mass = calculateMolarMass(fragment) + additionalMass;
      return {
          sequence: fragment,
          mass,
          difference: mass - targetMass
      };
  });

  // Sort by absolute difference
  results.sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference));

  // Display results
  elements.resultsTable.innerHTML = results.slice(0, maxResults)
      .map(result => {
          const formattedDifference = result.difference > 0 ? `+${result.difference}` : result.difference;
          return `
              <tr>
                  <td>${formatSequence(result.sequence)}</td>
                  <td>${result.mass}</td>
                  <td>${formattedDifference}</td>
              </tr>
          `;
      }).join('');
}

// Event listeners
elements.calculateBtn.addEventListener('click', updateResults);
elements.maxResults.addEventListener('change', updateResults);  