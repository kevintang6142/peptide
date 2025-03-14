# Peptide Fragment Analyzer

A web-based tool for analyzing peptide fragments and identifying matches based on mass spectrometry data.

## Overview

The Peptide Fragment Analyzer is a client-side application that allows researchers and scientists to:

- Input amino acid sequences using 1-letter or 3-letter codes
- Generate all possible fragments from a peptide sequence
- Calculate the molar mass of each fragment
- Compare fragment masses against mass spectrum data
- Find the best matching fragments based on mass difference

## Features

- **Flexible Input**: Accept amino acid sequences in both 1-letter (e.g., ACGT) and 3-letter (e.g., Ala-Cys-Gly-Thr) formats
- **Mass Calculations**: Calculate precise molecular weights for all possible fragments
- **Additional Mass Support**: Account for chemical modifications or adducts
- **Sortable Results**: Display fragments sorted by closest match to target mass
- **Configurable Output**: Set maximum number of results to display

## Usage

1. Enter the amino acid sequence in the text area
2. Select the sequence format (1-letter or 3-letter codes)
3. Input the target mass from your mass spectrometry data
4. Add any additional molecule mass if applicable
5. Click "Calculate Fragments" to generate results
6. Review the closest matches sorted by mass difference

## Access the Tool

This is a standalone web application that runs entirely in the browser.  
Simply visit [https://kevintang6142.github.io/peptide/](https://kevintang6142.github.io/peptide/) to use the tool.

## Technical Details

- Built with vanilla JavaScript, HTML, and CSS
- Performs all calculations locally in the browser
- Includes a comprehensive database of amino acid masses
- Supports all 20 standard amino acids
- Accounts for water loss in peptide bond formation