#!/usr/bin/env python3
"""
add_two_numbers.py
Simple script to add two numbers.

Usage:
  python add_two_numbers.py 3 4
  python add_two_numbers.py      # then enter numbers when prompted

The script accepts integers or floats. If both inputs are integers, the output is printed as an integer; otherwise as a float.
"""
import sys


def read_number(prompt):
    s = input(prompt).strip()
    try:
        if any(c in s for c in ('.', 'e', 'E')):
            return float(s)
        return int(s)
    except ValueError:
        raise ValueError(f"Invalid number: {s!r}")


def main():
    if len(sys.argv) >= 3:
        a_str, b_str = sys.argv[1], sys.argv[2]
        try:
            a = float(a_str) if any(c in a_str for c in ('.', 'e', 'E')) else int(a_str)
            b = float(b_str) if any(c in b_str for c in ('.', 'e', 'E')) else int(b_str)
        except ValueError:
            print("Error: both command-line arguments must be numbers.", file=sys.stderr)
            sys.exit(2)
    else:
        try:
            a = read_number("Enter first number: ")
            b = read_number("Enter second number: ")
        except ValueError as e:
            print("Error:", e, file=sys.stderr)
            sys.exit(2)

    result = a + b
    # Print as int when both inputs were ints and result is integral
    if isinstance(a, int) and isinstance(b, int):
        print(result)
    else:
        # Format to remove trailing zeros for readability
        print(result)


if __name__ == "__main__":
    main()
