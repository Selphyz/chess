import { fileToNumber } from '../../src/utils/movement';

describe('fileToNumber', () => {
  it("Converts lowercase file character 'a' to number 1.", () => {
    expect(fileToNumber('a')).toBe(1);
  });

  it("Converts lowercase file character 'h' to number 8.", () => {
    expect(fileToNumber('h')).toBe(8);
  });

  it("Converts a middle-range lowercase file character, such as 'd', to its correct number.", () => {
    expect(fileToNumber('d')).toBe(4);
  });

  it("Handles input of an uppercase file character, such as 'A', and returns the correct or expected value.", () => {
    expect(fileToNumber('A')).toBe('A'.charCodeAt(0) - 'a'.charCodeAt(0) + 1);
  });

  it("Handles input of a non-alphabetic character, such as '1', and returns the correct or expected value.", () => {
    expect(fileToNumber('1')).toBe('1'.charCodeAt(0) - 'a'.charCodeAt(0) + 1);
  });

  it('Handles input of an empty string and returns the correct or expected value.', () => {
    expect(() => fileToNumber('')).toThrow();
  });

  it("Correctly converts each valid lowercase file character from 'a' to 'h' inclusively to its corresponding number in a loop.", () => {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    files.forEach((file, idx) => {
      expect(fileToNumber(file)).toBe(idx + 1);
    });
  });

  it("Handles input of a string with more than one character and returns the correct or expected value.", () => {
    // Should only consider the first character, so 'ab' should be treated as 'a'
    expect(fileToNumber('ab')).toBe(1);
    expect(fileToNumber('h1')).toBe(8);
    expect(fileToNumber('zq')).toBe('z'.charCodeAt(0) - 'a'.charCodeAt(0) + 1);
  });
});
