// Amino acid data with masses and codes
const aminoAcids = {
  // 1-letter code: [3-letter code, mass]
  'A': ['Ala', 89.09404],
  'R': ['Arg', 174.20174],
  'N': ['Asn', 132.11904],
  'D': ['Asp', 133.10384],
  'C': ['Cys', 121.15404],
  'E': ['Glu', 147.13074],
  'Q': ['Gln', 146.14594],
  'G': ['Gly', 75.06714],
  'H': ['His', 155.15634],
  'I': ['Ile', 131.17464],
  'L': ['Leu', 131.17464],
  'K': ['Lys', 146.18934],
  'M': ['Met', 149.20784],
  'F': ['Phe', 165.19184],
  'P': ['Pro', 115.13194],
  'S': ['Ser', 105.09344],
  'T': ['Thr', 119.11904],
  'W': ['Trp', 204.22844],
  'Y': ['Tyr', 181.19124],
  'V': ['Val', 117.14784]
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