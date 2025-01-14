const WATER_MASS = 18.015;
let TAG_MASS = 0;
let FLOAT_TOLERANCE = 0.1;

const AMINO_ACID_MASSES = {
  'ALA': 89.1, 'ARG': 174.2, 'ASN': 132.1, 'ASP': 133.1,
  'CYS': 121.2, 'GLN': 146.2, 'GLU': 147.1, 'GLY': 75.1,
  'HIS': 155.2, 'ILE': 131.2, 'LEU': 131.2, 'LYS': 146.2,
  'MET': 149.2, 'PHE': 165.2, 'PRO': 115.1, 'SER': 105.1,
  'THR': 119.1, 'TRP': 204.2, 'TYR': 181.2, 'VAL': 117.1
};

const peptideSequenceInput = document.getElementById('peptideSequence');
const spectrumValuesInput = document.getElementById('spectrumValues');
const deleteLastPeptideButton = document.getElementById('deleteLastPeptide');
const clearPeptideButton = document.getElementById('clearPeptide');
const clearSpectrumButton = document.getElementById('clearSpectrum');
const calculateButton = document.getElementById('calculateButton');
const resultsDiv = document.getElementById('results');
const aminoAcidButtonsDiv = document.getElementById('aminoAcidButtons');
const peptideError = document.getElementById('peptideError');
const spectrumError = document.getElementById('spectrumError');

Object.keys(AMINO_ACID_MASSES).forEach(aa => {
  const button = document.createElement('button');
  button.textContent = aa;
  button.className = 'amino-acid-button';
  button.onclick = () => addPeptide(aa);
  button.title = `${aa} (${AMINO_ACID_MASSES[aa]} Da)`;
  aminoAcidButtonsDiv.appendChild(button);
});

const settingsDiv = document.createElement('div');
settingsDiv.className = 'settings-group';
settingsDiv.innerHTML = `
  <div class="input-group">
    <label>Molecule Mass (Da)</label>
    <input type="number" id="tagMass" value="0" step="0.1" min="0" class="number-input">
  </div>
  <div class="input-group">
    <label>Error Margin (±Da)</label>
    <input type="number" id="errorMargin" value="0.1" step="0.01" min="0.01" max="10" class="number-input">
  </div>
`;

calculateButton.parentNode.insertBefore(settingsDiv, calculateButton);

const tagMassInput = document.getElementById('tagMass');
const errorMarginInput = document.getElementById('errorMargin');

tagMassInput.addEventListener('input', () => {
    const value = parseFloat(tagMassInput.value);
    if (value >= 0) {
      TAG_MASS = value;
    }
  });

errorMarginInput.addEventListener('input', () => {
  const value = parseFloat(errorMarginInput.value);
  if (value >= 0) {
    FLOAT_TOLERANCE = value;
  }
});

function calculateSegmentMass(segment) {
  let totalMass = segment.reduce((sum, aa) => sum + AMINO_ACID_MASSES[aa], 0);
  if (segment.length > 1) {
    totalMass += -WATER_MASS * (segment.length - 1);
  }
  return totalMass;
}

function permute(arr) {
  if (arr.length <= 1) return [arr];
  return arr.reduce((perms, item, i) => {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    return perms.concat(
      permute(rest).map(p => [item, ...p])
    );
  }, []);
}

function findPeptideSplits(peptide, targetMasses) {
const validSplits = [];

for (const massArrangement of permute(targetMasses)) {
    let currentSplit = [];
    let currentSegment = [];
    let peptideIndex = 0;
    let valid = true;
    let tagUsed = false;

    while (peptideIndex < peptide.length) {
    currentSegment.push(peptide[peptideIndex]);
    const currentMass = calculateSegmentMass(currentSegment);

    if (currentSplit.length < massArrangement.length) {
        const target = massArrangement[currentSplit.length];
        
        if (Math.abs(currentMass - target) <= FLOAT_TOLERANCE) {
        currentSplit.push({ segment: [...currentSegment], tagged: false });
        currentSegment = [];
        } else if (!tagUsed && TAG_MASS > 0 && Math.abs(currentMass + TAG_MASS - target) <= FLOAT_TOLERANCE) {
        currentSplit.push({ segment: [...currentSegment], tagged: true });
        currentSegment = [];
        tagUsed = true;
        } else if (currentMass >= target + FLOAT_TOLERANCE) {
        valid = false;
        break;
        }
    }
    peptideIndex++;
    }

    if (valid && 
        currentSplit.length === massArrangement.length && 
        peptideIndex === peptide.length && 
        currentSegment.length === 0 && 
        (tagUsed || TAG_MASS === 0)) {
    validSplits.push(currentSplit);
    }
}

return validSplits;
}

function validatePeptideSequence(sequence, showError = false) {
  if (!sequence.trim()) {
    return { 
      valid: false, 
      error: showError ? 'Please enter a peptide sequence' : '' 
    };
  }

  const peptides = sequence.trim().split(/\s+/);
  const invalidPeptides = peptides.filter(p => !AMINO_ACID_MASSES[p]);

  if (invalidPeptides.length > 0) {
    return { 
      valid: false, 
      error: showError ? `Invalid amino acid code${invalidPeptides.length > 1 ? 's' : ''}: ${invalidPeptides.join(', ')}` : ''
    };
  }

  return { valid: true, error: '' };
}

function validateSpectrumValues(values, showError = false) {
  if (!values.trim()) {
    return { 
      valid: false, 
      error: showError ? 'Please enter mass spectrum values' : '' 
    };
  }

  const numbers = values.trim().split(/\s+/);
  const invalidNumbers = numbers.filter(n => isNaN(parseFloat(n)) || !isFinite(n));

  if (invalidNumbers.length > 0) {
    return { 
      valid: false, 
      error: showError ? `Invalid number${invalidNumbers.length > 1 ? 's' : ''}: ${invalidNumbers.join(', ')}` : ''
    };
  }

  if (numbers.some(n => parseFloat(n) <= 0)) {
    return { 
      valid: false, 
      error: showError ? 'All mass values must be positive' : ''
    };
  }

  return { valid: true, error: '' };
}

function addPeptide(peptide) {
  const currentValue = peptideSequenceInput.value;
  peptideSequenceInput.value = `${currentValue}${currentValue ? ' ' : ''}${peptide}`;
  peptideSequenceInput.scrollTop = peptideSequenceInput.scrollHeight;
  validateInputs();
}

function deleteLastPeptide() {
  const peptides = peptideSequenceInput.value.trim().split(/\s+/);
  peptides.pop();
  peptideSequenceInput.value = peptides.join(' ') + (peptides.length ? ' ' : '');
  validateInputs();
}

function clearPeptide() {
  peptideSequenceInput.value = '';
  peptideError.textContent = '';
  validateInputs();
}

function clearSpectrum() {
  spectrumValuesInput.value = '';
  spectrumError.textContent = '';
  validateInputs();
}

function validateInputs() {
  const peptideValidation = validatePeptideSequence(peptideSequenceInput.value, true);
  const spectrumValidation = validateSpectrumValues(spectrumValuesInput.value, true);
  const tagMassValue = tagMassInput.value.trim();
  const errorMarginValue = errorMarginInput.value.trim();

  peptideError.textContent = peptideValidation.error;
  spectrumError.textContent = spectrumValidation.error;

  if (tagMassValue === '') {
    tagMassInput.value = '0';
    TAG_MASS = 0;
  }
  
  if (errorMarginValue === '') {
    errorMarginInput.value = '0.1';
    FLOAT_TOLERANCE = 0.1;
  }

  calculateButton.disabled = !peptideValidation.valid || !spectrumValidation.valid;
}

function handleCalculate() {
    const peptideValidation = validatePeptideSequence(peptideSequenceInput.value, true);
    const spectrumValidation = validateSpectrumValues(spectrumValuesInput.value, true);
    const tagMassValue = tagMassInput.value.trim();
    const errorMarginValue = errorMarginInput.value.trim();

    peptideError.textContent = peptideValidation.error;
    spectrumError.textContent = spectrumValidation.error;

    if (tagMassValue === '') {
        tagMassInput.value = '0';
        TAG_MASS = 0;
    }

    if (errorMarginValue === '') {
        errorMarginInput.value = '0.1';
        FLOAT_TOLERANCE = 0.1;
    }

    if (!peptideValidation.valid || !spectrumValidation.valid) {
        return;
    }

    try {
        const peptide = peptideSequenceInput.value.trim().split(/\s+/);
        const spectrum = spectrumValuesInput.value.trim().split(/\s+/).map(Number);
        
        const possibleSplits = findPeptideSplits(peptide, spectrum);
        
        resultsDiv.innerHTML = '';
        
        if (possibleSplits.length > 0) {
        possibleSplits.forEach((split, index) => {
            const segments = split.map((entry, idx) => {
            const spectrumMass = spectrum[idx];
            return `${entry.segment.join(' ')} (${spectrumMass.toFixed(1)})${entry.tagged ? ' [MOLECULE]' : ''}`;
            });
            
            const resultDiv = document.createElement('div');
            resultDiv.className = 'result-item';
            resultDiv.textContent = `${index + 1}. ${segments.join(' | ')}`;
            resultsDiv.appendChild(resultDiv);
        });
        } else {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';
        resultDiv.textContent = 'No valid fragmentations found for the given spectrum.';
        resultsDiv.appendChild(resultDiv);
        }
    } catch (e) {
        console.error(e);
        const resultDiv = document.createElement('div');
        resultDiv.className = 'result-item';
        resultDiv.textContent = 'An error occurred while calculating. Please check your input and try again.';
        resultsDiv.appendChild(resultDiv);
    }
}

deleteLastPeptideButton.onclick = deleteLastPeptide;
clearPeptideButton.onclick = clearPeptide;
clearSpectrumButton.onclick = clearSpectrum;
calculateButton.onclick = handleCalculate;

peptideSequenceInput.addEventListener('input', validateInputs);
spectrumValuesInput.addEventListener('input', validateInputs);

[peptideSequenceInput, spectrumValuesInput].forEach(input => {
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text');
    const formatted = text.replace(/\s+/g, ' ').trim();
    document.execCommand('insertText', false, formatted);
  });
});