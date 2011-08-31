// # Sylvester
// Vector and Matrix mathematics modules for JavaScript
// Copyright (c) 2007 James Coglan
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the "Software"),
// to deal in the Software without restriction, including without limitation
// the rights to use, copy, modify, merge, publish, distribute, sublicense,
// and/or sell copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
// THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

var Sylvester = {
  version: '0.1.3',
  precision: 1e-6
};

function Vector() {}
Vector.prototype = {

  // Returns element i of the vector
  e: function(i) {
    return (i < 1 || i > this.elements.length) ? null : this.elements[i-1];
  },

  // Returns the number of elements the vector has
  dimensions: function() {
    return this.elements.length;
  },

  // Returns the modulus ('length') of the vector
  modulus: function() {
    return Math.sqrt(this.dot(this));
  },

  // Returns true iff the vector is equal to the argument
  eql: function(vector) {
    var n = this.elements.length;
    var V = vector.elements || vector;
    if (n != V.length) { return false; }
    do {
      if (Math.abs(this.elements[n-1] - V[n-1]) > Sylvester.precision) { return false; }
    } while (--n);
    return true;
  },

  // Returns a copy of the vector
  dup: function() {
    return Vector.create(this.elements);
  },

  // Maps the vector to another vector according to the given function
  map: function(fn) {
    var elements = [];
    this.each(function(x, i) {
      elements.push(fn(x, i));
    });
    return Vector.create(elements);
  },
  
  // Calls the iterator for each element of the vector in turn
  each: function(fn) {
    var n = this.elements.length, k = n, i;
    do { i = k - n;
      fn(this.elements[i], i+1);
    } while (--n);
  },

  // Returns a new vector created by normalizing the receiver
  toUnitVector: function() {
    var r = this.modulus();
    if (r === 0) { return this.dup(); }
    return this.map(function(x) { return x/r; });
  },

  // Returns the angle between the vector and the argument (also a vector)
  angleFrom: function(vector) {
    var V = vector.elements || vector;
    var n = this.elements.length, k = n, i;
    if (n != V.length) { return null; }
    var dot = 0, mod1 = 0, mod2 = 0;
    // Work things out in parallel to save time
    this.each(function(x, i) {
      dot += x * V[i-1];
      mod1 += x * x;
      mod2 += V[i-1] * V[i-1];
    });
    mod1 = Math.sqrt(mod1); mod2 = Math.sqrt(mod2);
    if (mod1*mod2 === 0) { return null; }
    var theta = dot / (mod1*mod2);
    if (theta < -1) { theta = -1; }
    if (theta > 1) { theta = 1; }
    return Math.acos(theta);
  },

  // Returns true iff the vector is parallel to the argument
  isParallelTo: function(vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (angle <= Sylvester.precision);
  },

  // Returns true iff the vector is antiparallel to the argument
  isAntiparallelTo: function(vector) {
    var angle = this.angleFrom(vector);
    return (angle === null) ? null : (Math.abs(angle - Math.PI) <= Sylvester.precision);
  },

  // Returns true iff the vector is perpendicular to the argument
  isPerpendicularTo: function(vector) {
    var dot = this.dot(vector);
    return (dot === null) ? null : (Math.abs(dot) <= Sylvester.precision);
  },

  // Returns the result of adding the argument to the vector
  add: function(vector) {
    var V = vector.elements || vector;
    if (this.elements.length != V.length) { return null; }
    return this.map(function(x, i) { return x + V[i-1]; });
  },

  // Returns the result of subtracting the argument from the vector
  subtract: function(vector) {
    var V = vector.elements || vector;
    if (this.elements.length != V.length) { return null; }
    return this.map(function(x, i) { return x - V[i-1]; });
  },

  // Returns the result of multiplying the elements of the vector by the argument
  multiply: function(k) {
    return this.map(function(x) { return x*k; });
  },

  x: function(k) { return this.multiply(k); },

  // Returns the scalar product of the vector with the argument
  // Both vectors must have equal dimensionality
  dot: function(vector) {
    var V = vector.elements || vector;
    var i, product = 0, n = this.elements.length;
    if (n != V.length) { return null; }
    do { product += this.elements[n-1] * V[n-1]; } while (--n);
    return product;
  },

  // Returns the vector product of the vector with the argument
  // Both vectors must have dimensionality 3
  cross: function(vector) {
    var B = vector.elements || vector;
    if (this.elements.length != 3 || B.length != 3) { return null; }
    var A = this.elements;
    return Vector.create([
      (A[1] * B[2]) - (A[2] * B[1]),
      (A[2] * B[0]) - (A[0] * B[2]),
      (A[0] * B[1]) - (A[1] * B[0])
    ]);
  },

  // Returns the (absolute) largest element of the vector
  max: function() {
    var m = 0, n = this.elements.length, k = n, i;
    do { i = k - n;
      if (Math.abs(this.elements[i]) > Math.abs(m)) { m = this.elements[i]; }
    } while (--n);
    return m;
  },

  // Returns the index of the first match found
  indexOf: function(x) {
    var index = null, n = this.elements.length, k = n, i;
    do { i = k - n;
      if (index === null && this.elements[i] == x) {
        index = i + 1;
      }
    } while (--n);
    return index;
  },

  // Returns a diagonal matrix with the vector's elements as its diagonal elements
  toDiagonalMatrix: function() {
    return Matrix.Diagonal(this.elements);
  },

  // Returns the result of rounding the elements of the vector
  round: function() {
    return this.map(function(x) { return Math.round(x); });
  },

  // Returns a copy of the vector with elements set to the given value if they
  // differ from it by less than Sylvester.precision
  snapTo: function(x) {
    return this.map(function(y) {
      return (Math.abs(y - x) <= Sylvester.precision) ? x : y;
    });
  },

  // Returns the vector's distance from the argument, when considered as a point in space
  distanceFrom: function(obj) {
    if (obj.anchor) { return obj.distanceFrom(this); }
    var V = obj.elements || obj;
    if (V.length != this.elements.length) { return null; }
    var sum = 0, part;
    this.each(function(x, i) {
      part = x - V[i-1];
      sum += part * part;
    });
    return Math.sqrt(sum);
  },

  // Returns true if the vector is point on the given line
  liesOn: function(line) {
    return line.contains(this);
  },

  // Return true iff the vector is a point in the given plane
  liesIn: function(plane) {
    return plane.contains(this);
  },

  // Rotates the vector about the given object. The object should be a 
  // point if the vector is 2D, and a line if it is 3D. Be careful with line directions!
  rotate: function(t, obj) {
    var V, R, x, y, z;
    switch (this.elements.length) {
      case 2:
        V = obj.elements || obj;
        if (V.length != 2) { return null; }
        R = Matrix.Rotation(t).elements;
        x = this.elements[0] - V[0];
        y = this.elements[1] - V[1];
        return Vector.create([
          V[0] + R[0][0] * x + R[0][1] * y,
          V[1] + R[1][0] * x + R[1][1] * y
        ]);
        break;
      case 3:
        if (!obj.direction) { return null; }
        var C = obj.pointClosestTo(this).elements;
        R = Matrix.Rotation(t, obj.direction).elements;
        x = this.elements[0] - C[0];
        y = this.elements[1] - C[1];
        z = this.elements[2] - C[2];
        return Vector.create([
          C[0] + R[0][0] * x + R[0][1] * y + R[0][2] * z,
          C[1] + R[1][0] * x + R[1][1] * y + R[1][2] * z,
          C[2] + R[2][0] * x + R[2][1] * y + R[2][2] * z
        ]);
        break;
      default:
        return null;
    }
  },

  // Returns the result of reflecting the point in the given point, line or plane
  reflectionIn: function(obj) {
    if (obj.anchor) {
      // obj is a plane or line
      var P = this.elements.slice();
      var C = obj.pointClosestTo(P).elements;
      return Vector.create([C[0] + (C[0] - P[0]), C[1] + (C[1] - P[1]), C[2] + (C[2] - (P[2] || 0))]);
    } else {
      // obj is a point
      var Q = obj.elements || obj;
      if (this.elements.length != Q.length) { return null; }
      return this.map(function(x, i) { return Q[i-1] + (Q[i-1] - x); });
    }
  },

  // Utility to make sure vectors are 3D. If they are 2D, a zero z-component is added
  to3D: function() {
    var V = this.dup();
    switch (V.elements.length) {
      case 3: break;
      case 2: V.elements.push(0); break;
      default: return null;
    }
    return V;
  },

  // Returns a string representation of the vector
  inspect: function() {
    return '[' + this.elements.join(', ') + ']';
  },

  // Set vector's elements from an array
  setElements: function(els) {
    this.elements = (els.elements || els).slice();
    return this;
  }
};
  
// Constructor function
Vector.create = function(elements) {
  var V = new Vector();
  return V.setElements(elements);
};

// i, j, k unit vectors
Vector.i = Vector.create([1,0,0]);
Vector.j = Vector.create([0,1,0]);
Vector.k = Vector.create([0,0,1]);

// Random vector of size n
Vector.Random = function(n) {
  var elements = [];
  do { elements.push(Math.random());
  } while (--n);
  return Vector.create(elements);
};

// Vector filled with zeros
Vector.Zero = function(n) {
  var elements = [];
  do { elements.push(0);
  } while (--n);
  return Vector.create(elements);
};



function Matrix() {}
Matrix.prototype = {

  // Returns element (i,j) of the matrix
  e: function(i,j) {
    if (i < 1 || i > this.elements.length || j < 1 || j > this.elements[0].length) { return null; }
    return this.elements[i-1][j-1];
  },

  // Returns row k of the matrix as a vector
  row: function(i) {
    if (i > this.elements.length) { return null; }
    return Vector.create(this.elements[i-1]);
  },

  // Returns column k of the matrix as a vector
  col: function(j) {
    if (j > this.elements[0].length) { return null; }
    var col = [], n = this.elements.length, k = n, i;
    do { i = k - n;
      col.push(this.elements[i][j-1]);
    } while (--n);
    return Vector.create(col);
  },

  // Returns the number of rows/columns the matrix has
  dimensions: function() {
    return {rows: this.elements.length, cols: this.elements[0].length};
  },

  // Returns the number of rows in the matrix
  rows: function() {
    return this.elements.length;
  },

  // Returns the number of columns in the matrix
  cols: function() {
    return this.elements[0].length;
  },

  // Returns true iff the matrix is equal to the argument. You can supply
  // a vector as the argument, in which case the receiver must be a
  // one-column matrix equal to the vector.
  eql: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    if (this.elements.length != M.length ||
        this.elements[0].length != M[0].length) { return false; }
    var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        if (Math.abs(this.elements[i][j] - M[i][j]) > Sylvester.precision) { return false; }
      } while (--nj);
    } while (--ni);
    return true;
  },

  // Returns a copy of the matrix
  dup: function() {
    return Matrix.create(this.elements);
  },

  // Maps the matrix to another matrix (of the same dimensions) according to the given function
  map: function(fn) {
    var els = [], ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do { i = ki - ni;
      nj = kj;
      els[i] = [];
      do { j = kj - nj;
        els[i][j] = fn(this.elements[i][j], i + 1, j + 1);
      } while (--nj);
    } while (--ni);
    return Matrix.create(els);
  },

  // Returns true iff the argument has the same dimensions as the matrix
  isSameSizeAs: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    return (this.elements.length == M.length &&
        this.elements[0].length == M[0].length);
  },

  // Returns the result of adding the argument to the matrix
  add: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; }
    return this.map(function(x, i, j) { return x + M[i-1][j-1]; });
  },

  // Returns the result of subtracting the argument from the matrix
  subtract: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    if (!this.isSameSizeAs(M)) { return null; }
    return this.map(function(x, i, j) { return x - M[i-1][j-1]; });
  },

  // Returns true iff the matrix can multiply the argument from the left
  canMultiplyFromLeft: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    // this.columns should equal matrix.rows
    return (this.elements[0].length == M.length);
  },

  // Returns the result of multiplying the matrix from the right by the argument.
  // If the argument is a scalar then just multiply all the elements. If the argument is
  // a vector, a vector is returned, which saves you having to remember calling
  // col(1) on the result.
  multiply: function(matrix) {
    if (!matrix.elements) {
      return this.map(function(x) { return x * matrix; });
    }
    var returnVector = matrix.modulus ? true : false;
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    if (!this.canMultiplyFromLeft(M)) { return null; }
    var ni = this.elements.length, ki = ni, i, nj, kj = M[0].length, j;
    var cols = this.elements[0].length, elements = [], sum, nc, c;
    do { i = ki - ni;
      elements[i] = [];
      nj = kj;
      do { j = kj - nj;
        sum = 0;
        nc = cols;
        do { c = cols - nc;
          sum += this.elements[i][c] * M[c][j];
        } while (--nc);
        elements[i][j] = sum;
      } while (--nj);
    } while (--ni);
    var M = Matrix.create(elements);
    return returnVector ? M.col(1) : M;
  },

  x: function(matrix) { return this.multiply(matrix); },

  // Returns a submatrix taken from the matrix
  // Argument order is: start row, start col, nrows, ncols
  // Element selection wraps if the required index is outside the matrix's bounds, so you could
  // use this to perform row/column cycling or copy-augmenting.
  minor: function(a, b, c, d) {
    var elements = [], ni = c, i, nj, j;
    var rows = this.elements.length, cols = this.elements[0].length;
    do { i = c - ni;
      elements[i] = [];
      nj = d;
      do { j = d - nj;
        elements[i][j] = this.elements[(a+i-1)%rows][(b+j-1)%cols];
      } while (--nj);
    } while (--ni);
    return Matrix.create(elements);
  },

  // Returns the transpose of the matrix
  transpose: function() {
    var rows = this.elements.length, cols = this.elements[0].length;
    var elements = [], ni = cols, i, nj, j;
    do { i = cols - ni;
      elements[i] = [];
      nj = rows;
      do { j = rows - nj;
        elements[i][j] = this.elements[j][i];
      } while (--nj);
    } while (--ni);
    return Matrix.create(elements);
  },

  // Returns true iff the matrix is square
  isSquare: function() {
    return (this.elements.length == this.elements[0].length);
  },

  // Returns the (absolute) largest element of the matrix
  max: function() {
    var m = 0, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        if (Math.abs(this.elements[i][j]) > Math.abs(m)) { m = this.elements[i][j]; }
      } while (--nj);
    } while (--ni);
    return m;
  },

  // Returns the indeces of the first match found by reading row-by-row from left to right
  indexOf: function(x) {
    var index = null, ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        if (this.elements[i][j] == x) { return {i: i+1, j: j+1}; }
      } while (--nj);
    } while (--ni);
    return null;
  },

  // If the matrix is square, returns the diagonal elements as a vector.
  // Otherwise, returns null.
  diagonal: function() {
    if (!this.isSquare) { return null; }
    var els = [], n = this.elements.length, k = n, i;
    do { i = k - n;
      els.push(this.elements[i][i]);
    } while (--n);
    return Vector.create(els);
  },

  // Make the matrix upper (right) triangular by Gaussian elimination.
  // This method only adds multiples of rows to other rows. No rows are
  // scaled up or switched, and the determinant is preserved.
  toRightTriangular: function() {
    var M = this.dup(), els;
    var n = this.elements.length, k = n, i, np, kp = this.elements[0].length, p;
    do { i = k - n;
      if (M.elements[i][i] == 0) {
        for (j = i + 1; j < k; j++) {
          if (M.elements[j][i] != 0) {
            els = []; np = kp;
            do { p = kp - np;
              els.push(M.elements[i][p] + M.elements[j][p]);
            } while (--np);
            M.elements[i] = els;
            break;
          }
        }
      }
      if (M.elements[i][i] != 0) {
        for (j = i + 1; j < k; j++) {
          var multiplier = M.elements[j][i] / M.elements[i][i];
          els = []; np = kp;
          do { p = kp - np;
            // Elements with column numbers up to an including the number
            // of the row that we're subtracting can safely be set straight to
            // zero, since that's the point of this routine and it avoids having
            // to loop over and correct rounding errors later
            els.push(p <= i ? 0 : M.elements[j][p] - M.elements[i][p] * multiplier);
          } while (--np);
          M.elements[j] = els;
        }
      }
    } while (--n);
    return M;
  },

  toUpperTriangular: function() { return this.toRightTriangular(); },

  // Returns the determinant for square matrices
  determinant: function() {
    if (!this.isSquare()) { return null; }
    var M = this.toRightTriangular();
    var det = M.elements[0][0], n = M.elements.length - 1, k = n, i;
    do { i = k - n + 1;
      det = det * M.elements[i][i];
    } while (--n);
    return det;
  },

  det: function() { return this.determinant(); },

  // Returns true iff the matrix is singular
  isSingular: function() {
    return (this.isSquare() && this.determinant() === 0);
  },

  // Returns the trace for square matrices
  trace: function() {
    if (!this.isSquare()) { return null; }
    var tr = this.elements[0][0], n = this.elements.length - 1, k = n, i;
    do { i = k - n + 1;
      tr += this.elements[i][i];
    } while (--n);
    return tr;
  },

  tr: function() { return this.trace(); },

  // Returns the rank of the matrix
  rank: function() {
    var M = this.toRightTriangular(), rank = 0;
    var ni = this.elements.length, ki = ni, i, nj, kj = this.elements[0].length, j;
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        if (Math.abs(M.elements[i][j]) > Sylvester.precision) { rank++; break; }
      } while (--nj);
    } while (--ni);
    return rank;
  },
  
  rk: function() { return this.rank(); },

  // Returns the result of attaching the given argument to the right-hand side of the matrix
  augment: function(matrix) {
    var M = matrix.elements || matrix;
    if (typeof(M[0][0]) == 'undefined') { M = Matrix.create(M).elements; }
    var T = this.dup(), cols = T.elements[0].length;
    var ni = T.elements.length, ki = ni, i, nj, kj = M[0].length, j;
    if (ni != M.length) { return null; }
    do { i = ki - ni;
      nj = kj;
      do { j = kj - nj;
        T.elements[i][cols + j] = M[i][j];
      } while (--nj);
    } while (--ni);
    return T;
  },

  // Returns the inverse (if one exists) using Gauss-Jordan
  inverse: function() {
    if (!this.isSquare() || this.isSingular()) { return null; }
    var ni = this.elements.length, ki = ni, i, j;
    var M = this.augment(Matrix.I(ni)).toRightTriangular();
    var np, kp = M.elements[0].length, p, els, divisor;
    var inverse_elements = [], new_element;
    // Matrix is non-singular so there will be no zeros on the diagonal
    // Cycle through rows from last to first
    do { i = ni - 1;
      // First, normalise diagonal elements to 1
      els = []; np = kp;
      inverse_elements[i] = [];
      divisor = M.elements[i][i];
      do { p = kp - np;
        new_element = M.elements[i][p] / divisor;
        els.push(new_element);
        // Shuffle of the current row of the right hand side into the results
        // array as it will not be modified by later runs through this loop
        if (p >= ki) { inverse_elements[i].push(new_element); }
      } while (--np);
      M.elements[i] = els;
      // Then, subtract this row from those above it to
      // give the identity matrix on the left hand side
      for (j = 0; j < i; j++) {
        els = []; np = kp;
        do { p = kp - np;
          els.push(M.elements[j][p] - M.elements[i][p] * M.elements[j][i]);
        } while (--np);
        M.elements[j] = els;
      }
    } while (--ni);
    return Matrix.create(inverse_elements);
  },

  inv: function() { return this.inverse(); },

  // Returns the result of rounding all the elements
  round: function() {
    return this.map(function(x) { return Math.round(x); });
  },

  // Returns a copy of the matrix with elements set to the given value if they
  // differ from it by less than Sylvester.precision
  snapTo: function(x) {
    return this.map(function(p) {
      return (Math.abs(p - x) <= Sylvester.precision) ? x : p;
    });
  },

  // Returns a string representation of the matrix
  inspect: function() {
    var matrix_rows = [];
    var n = this.elements.length, k = n, i;
    do { i = k - n;
      matrix_rows.push(Vector.create(this.elements[i]).inspect());
    } while (--n);
    return matrix_rows.join('\n');
  },

  // Set the matrix's elements from an array. If the argument passed
  // is a vector, the resulting matrix will be a single column.
  setElements: function(els) {
    var i, elements = els.elements || els;
    if (typeof(elements[0][0]) != 'undefined') {
      var ni = elements.length, ki = ni, nj, kj, j;
      this.elements = [];
      do { i = ki - ni;
        nj = elements[i].length; kj = nj;
        this.elements[i] = [];
        do { j = kj - nj;
          this.elements[i][j] = elements[i][j];
        } while (--nj);
      } while(--ni);
      return this;
    }
    var n = elements.length, k = n;
    this.elements = [];
    do { i = k - n;
      this.elements.push([elements[i]]);
    } while (--n);
    return this;
  }
};

// Constructor function
Matrix.create = function(elements) {
  var M = new Matrix();
  return M.setElements(elements);
};

// Identity matrix of size n
Matrix.I = function(n) {
  var els = [], k = n, i, nj, j;
  do { i = k - n;
    els[i] = []; nj = k;
    do { j = k - nj;
      els[i][j] = (i == j) ? 1 : 0;
    } while (--nj);
  } while (--n);
  return Matrix.create(els);
};

// Diagonal matrix - all off-diagonal elements are zero
Matrix.Diagonal = function(elements) {
  var n = elements.length, k = n, i;
  var M = Matrix.I(n);
  do { i = k - n;
    M.elements[i][i] = elements[i];
  } while (--n);
  return M;
};

// Rotation matrix about some axis. If no axis is
// supplied, assume we're after a 2D transform
Matrix.Rotation = function(theta, a) {
  if (!a) {
    return Matrix.create([
      [Math.cos(theta),  -Math.sin(theta)],
      [Math.sin(theta),   Math.cos(theta)]
    ]);
  }
  var axis = a.dup();
  if (axis.elements.length != 3) { return null; }
  var mod = axis.modulus();
  var x = axis.elements[0]/mod, y = axis.elements[1]/mod, z = axis.elements[2]/mod;
  var s = Math.sin(theta), c = Math.cos(theta), t = 1 - c;
  // Formula derived here: http://www.gamedev.net/reference/articles/article1199.asp
  // That proof rotates the co-ordinate system so theta
  // becomes -theta and sin becomes -sin here.
  return Matrix.create([
    [ t*x*x + c, t*x*y - s*z, t*x*z + s*y ],
    [ t*x*y + s*z, t*y*y + c, t*y*z - s*x ],
    [ t*x*z - s*y, t*y*z + s*x, t*z*z + c ]
  ]);
};

// Special case rotations
Matrix.RotationX = function(t) {
  var c = Math.cos(t), s = Math.sin(t);
  return Matrix.create([
    [  1,  0,  0 ],
    [  0,  c, -s ],
    [  0,  s,  c ]
  ]);
};
Matrix.RotationY = function(t) {
  var c = Math.cos(t), s = Math.sin(t);
  return Matrix.create([
    [  c,  0,  s ],
    [  0,  1,  0 ],
    [ -s,  0,  c ]
  ]);
};
Matrix.RotationZ = function(t) {
  var c = Math.cos(t), s = Math.sin(t);
  return Matrix.create([
    [  c, -s,  0 ],
    [  s,  c,  0 ],
    [  0,  0,  1 ]
  ]);
};

// Random matrix of n rows, m columns
Matrix.Random = function(n, m) {
  return Matrix.Zero(n, m).map(
    function() { return Math.random(); }
  );
};

// Matrix filled with zeros
Matrix.Zero = function(n, m) {
  var els = [], ni = n, i, nj, j;
  do { i = n - ni;
    els[i] = [];
    nj = m;
    do { j = m - nj;
      els[i][j] = 0;
    } while (--nj);
  } while (--ni);
  return Matrix.create(els);
};



function Line() {}
Line.prototype = {

  // Returns true if the argument occupies the same space as the line
  eql: function(line) {
    return (this.isParallelTo(line) && this.contains(line.anchor));
  },

  // Returns a copy of the line
  dup: function() {
    return Line.create(this.anchor, this.direction);
  },

  // Returns the result of translating the line by the given vector/array
  translate: function(vector) {
    var V = vector.elements || vector;
    return Line.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.direction);
  },

  // Returns true if the line is parallel to the argument. Here, 'parallel to'
  // means that the argument's direction is either parallel or antiparallel to
  // the line's own direction. A line is parallel to a plane if the two do not
  // have a unique intersection.
  isParallelTo: function(obj) {
    if (obj.normal) { return obj.isParallelTo(this); }
    var theta = this.direction.angleFrom(obj.direction);
    return (Math.abs(theta) <= Sylvester.precision || Math.abs(theta - Math.PI) <= Sylvester.precision);
  },

  // Returns the line's perpendicular distance from the argument,
  // which can be a point, a line or a plane
  distanceFrom: function(obj) {
    if (obj.normal) { return obj.distanceFrom(this); }
    if (obj.direction) {
      // obj is a line
      if (this.isParallelTo(obj)) { return this.distanceFrom(obj.anchor); }
      var N = this.direction.cross(obj.direction).toUnitVector().elements;
      var A = this.anchor.elements, B = obj.anchor.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, D = this.direction.elements;
      var PA1 = P[0] - A[0], PA2 = P[1] - A[1], PA3 = (P[2] || 0) - A[2];
      var modPA = Math.sqrt(PA1*PA1 + PA2*PA2 + PA3*PA3);
      if (modPA === 0) return 0;
      // Assumes direction vector is normalized
      var cosTheta = (PA1 * D[0] + PA2 * D[1] + PA3 * D[2]) / modPA;
      var sin2 = 1 - cosTheta*cosTheta;
      return Math.abs(modPA * Math.sqrt(sin2 < 0 ? 0 : sin2));
    }
  },

  // Returns true iff the argument is a point on the line
  contains: function(point) {
    var dist = this.distanceFrom(point);
    return (dist !== null && dist <= Sylvester.precision);
  },

  // Returns true iff the line lies in the given plane
  liesIn: function(plane) {
    return plane.contains(this);
  },

  // Returns true iff the line has a unique point of intersection with the argument
  intersects: function(obj) {
    if (obj.normal) { return obj.intersects(this); }
    return (!this.isParallelTo(obj) && this.distanceFrom(obj) <= Sylvester.precision);
  },

  // Returns the unique intersection point with the argument, if one exists
  intersectionWith: function(obj) {
    if (obj.normal) { return obj.intersectionWith(this); }
    if (!this.intersects(obj)) { return null; }
    var P = this.anchor.elements, X = this.direction.elements,
        Q = obj.anchor.elements, Y = obj.direction.elements;
    var X1 = X[0], X2 = X[1], X3 = X[2], Y1 = Y[0], Y2 = Y[1], Y3 = Y[2];
    var PsubQ1 = P[0] - Q[0], PsubQ2 = P[1] - Q[1], PsubQ3 = P[2] - Q[2];
    var XdotQsubP = - X1*PsubQ1 - X2*PsubQ2 - X3*PsubQ3;
    var YdotPsubQ = Y1*PsubQ1 + Y2*PsubQ2 + Y3*PsubQ3;
    var XdotX = X1*X1 + X2*X2 + X3*X3;
    var YdotY = Y1*Y1 + Y2*Y2 + Y3*Y3;
    var XdotY = X1*Y1 + X2*Y2 + X3*Y3;
    var k = (XdotQsubP * YdotY / XdotX + XdotY * YdotPsubQ) / (YdotY - XdotY * XdotY);
    return Vector.create([P[0] + k*X1, P[1] + k*X2, P[2] + k*X3]);
  },

  // Returns the point on the line that is closest to the given point or line
  pointClosestTo: function(obj) {
    if (obj.direction) {
      // obj is a line
      if (this.intersects(obj)) { return this.intersectionWith(obj); }
      if (this.isParallelTo(obj)) { return null; }
      var D = this.direction.elements, E = obj.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], E1 = E[0], E2 = E[1], E3 = E[2];
      // Create plane containing obj and the shared normal and intersect this with it
      // Thank you: http://www.cgafaq.info/wiki/Line-line_distance
      var x = (D3 * E1 - D1 * E3), y = (D1 * E2 - D2 * E1), z = (D2 * E3 - D3 * E2);
      var N = Vector.create([x * E3 - y * E2, y * E1 - z * E3, z * E2 - x * E1]);
      var P = Plane.create(obj.anchor, N);
      return P.intersectionWith(this);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      if (this.contains(P)) { return Vector.create(P); }
      var A = this.anchor.elements, D = this.direction.elements;
      var D1 = D[0], D2 = D[1], D3 = D[2], A1 = A[0], A2 = A[1], A3 = A[2];
      var x = D1 * (P[1]-A2) - D2 * (P[0]-A1), y = D2 * ((P[2] || 0) - A3) - D3 * (P[1]-A2),
          z = D3 * (P[0]-A1) - D1 * ((P[2] || 0) - A3);
      var V = Vector.create([D2 * x - D3 * z, D3 * y - D1 * x, D1 * z - D2 * y]);
      var k = this.distanceFrom(P) / V.modulus();
      return Vector.create([
        P[0] + V.elements[0] * k,
        P[1] + V.elements[1] * k,
        (P[2] || 0) + V.elements[2] * k
      ]);
    }
  },

  // Returns a copy of the line rotated by t radians about the given line. Works by
  // finding the argument's closest point to this line's anchor point (call this C) and
  // rotating the anchor about C. Also rotates the line's direction about the argument's.
  // Be careful with this - the rotation axis' direction affects the outcome!
  rotate: function(t, line) {
    // If we're working in 2D
    if (typeof(line.direction) == 'undefined') { line = Line.create(line.to3D(), Vector.k); }
    var R = Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, D = this.direction.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Line.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * D[0] + R[0][1] * D[1] + R[0][2] * D[2],
      R[1][0] * D[0] + R[1][1] * D[1] + R[1][2] * D[2],
      R[2][0] * D[0] + R[2][1] * D[1] + R[2][2] * D[2]
    ]);
  },

  // Returns the line's reflection in the given point or line
  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, D = this.direction.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], D1 = D[0], D2 = D[1], D3 = D[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the line's direction vector to its anchor, then mirror that in the plane
      var AD1 = A1 + D1, AD2 = A2 + D2, AD3 = A3 + D3;
      var Q = obj.pointClosestTo([AD1, AD2, AD3]).elements;
      var newD = [Q[0] + (Q[0] - AD1) - newA[0], Q[1] + (Q[1] - AD2) - newA[1], Q[2] + (Q[2] - AD3) - newA[2]];
      return Line.create(newA, newD);
    } else if (obj.direction) {
      // obj is a line - reflection obtained by rotating PI radians about obj
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point - just reflect the line's anchor in it
      var P = obj.elements || obj;
      return Line.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.direction);
    }
  },

  // Set the line's anchor point and direction.
  setVectors: function(anchor, direction) {
    // Need to do this so that line's properties are not
    // references to the arguments passed in
    anchor = Vector.create(anchor);
    direction = Vector.create(direction);
    if (anchor.elements.length == 2) {anchor.elements.push(0); }
    if (direction.elements.length == 2) { direction.elements.push(0); }
    if (anchor.elements.length > 3 || direction.elements.length > 3) { return null; }
    var mod = direction.modulus();
    if (mod === 0) { return null; }
    this.anchor = anchor;
    this.direction = Vector.create([
      direction.elements[0] / mod,
      direction.elements[1] / mod,
      direction.elements[2] / mod
    ]);
    return this;
  }
};

  
// Constructor function
Line.create = function(anchor, direction) {
  var L = new Line();
  return L.setVectors(anchor, direction);
};

// Axes
Line.X = Line.create(Vector.Zero(3), Vector.i);
Line.Y = Line.create(Vector.Zero(3), Vector.j);
Line.Z = Line.create(Vector.Zero(3), Vector.k);



function Plane() {}
Plane.prototype = {

  // Returns true iff the plane occupies the same space as the argument
  eql: function(plane) {
    return (this.contains(plane.anchor) && this.isParallelTo(plane));
  },

  // Returns a copy of the plane
  dup: function() {
    return Plane.create(this.anchor, this.normal);
  },

  // Returns the result of translating the plane by the given vector
  translate: function(vector) {
    var V = vector.elements || vector;
    return Plane.create([
      this.anchor.elements[0] + V[0],
      this.anchor.elements[1] + V[1],
      this.anchor.elements[2] + (V[2] || 0)
    ], this.normal);
  },

  // Returns true iff the plane is parallel to the argument. Will return true
  // if the planes are equal, or if you give a line and it lies in the plane.
  isParallelTo: function(obj) {
    var theta;
    if (obj.normal) {
      // obj is a plane
      theta = this.normal.angleFrom(obj.normal);
      return (Math.abs(theta) <= Sylvester.precision || Math.abs(Math.PI - theta) <= Sylvester.precision);
    } else if (obj.direction) {
      // obj is a line
      return this.normal.isPerpendicularTo(obj.direction);
    }
    return null;
  },
  
  // Returns true iff the receiver is perpendicular to the argument
  isPerpendicularTo: function(plane) {
    var theta = this.normal.angleFrom(plane.normal);
    return (Math.abs(Math.PI/2 - theta) <= Sylvester.precision);
  },

  // Returns the plane's distance from the given object (point, line or plane)
  distanceFrom: function(obj) {
    if (this.intersects(obj) || this.contains(obj)) { return 0; }
    if (obj.anchor) {
      // obj is a plane or line
      var A = this.anchor.elements, B = obj.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - B[0]) * N[0] + (A[1] - B[1]) * N[1] + (A[2] - B[2]) * N[2]);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      return Math.abs((A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2]);
    }
  },

  // Returns true iff the plane contains the given point or line
  contains: function(obj) {
    if (obj.normal) { return null; }
    if (obj.direction) {
      return (this.contains(obj.anchor) && this.contains(obj.anchor.add(obj.direction)));
    } else {
      var P = obj.elements || obj;
      var A = this.anchor.elements, N = this.normal.elements;
      var diff = Math.abs(N[0]*(A[0] - P[0]) + N[1]*(A[1] - P[1]) + N[2]*(A[2] - (P[2] || 0)));
      return (diff <= Sylvester.precision);
    }
  },

  // Returns true iff the plane has a unique point/line of intersection with the argument
  intersects: function(obj) {
    if (typeof(obj.direction) == 'undefined' && typeof(obj.normal) == 'undefined') { return null; }
    return !this.isParallelTo(obj);
  },

  // Returns the unique intersection with the argument, if one exists. The result
  // will be a vector if a line is supplied, and a line if a plane is supplied.
  intersectionWith: function(obj) {
    if (!this.intersects(obj)) { return null; }
    if (obj.direction) {
      // obj is a line
      var A = obj.anchor.elements, D = obj.direction.elements,
          P = this.anchor.elements, N = this.normal.elements;
      var multiplier = (N[0]*(P[0]-A[0]) + N[1]*(P[1]-A[1]) + N[2]*(P[2]-A[2])) / (N[0]*D[0] + N[1]*D[1] + N[2]*D[2]);
      return Vector.create([A[0] + D[0]*multiplier, A[1] + D[1]*multiplier, A[2] + D[2]*multiplier]);
    } else if (obj.normal) {
      // obj is a plane
      var direction = this.normal.cross(obj.normal).toUnitVector();
      // To find an anchor point, we find one co-ordinate that has a value
      // of zero somewhere on the intersection, and remember which one we picked
      var N = this.normal.elements, A = this.anchor.elements,
          O = obj.normal.elements, B = obj.anchor.elements;
      var solver = Matrix.Zero(2,2), i = 0;
      while (solver.isSingular()) {
        i++;
        solver = Matrix.create([
          [ N[i%3], N[(i+1)%3] ],
          [ O[i%3], O[(i+1)%3]  ]
        ]);
      }
      // Then we solve the simultaneous equations in the remaining dimensions
      var inverse = solver.inverse().elements;
      var x = N[0]*A[0] + N[1]*A[1] + N[2]*A[2];
      var y = O[0]*B[0] + O[1]*B[1] + O[2]*B[2];
      var intersection = [
        inverse[0][0] * x + inverse[0][1] * y,
        inverse[1][0] * x + inverse[1][1] * y
      ];
      var anchor = [];
      for (var j = 1; j <= 3; j++) {
        // This formula picks the right element from intersection by
        // cycling depending on which element we set to zero above
        anchor.push((i == j) ? 0 : intersection[(j + (5 - i)%3)%3]);
      }
      return Line.create(anchor, direction);
    }
  },

  // Returns the point in the plane closest to the given point
  pointClosestTo: function(point) {
    var P = point.elements || point;
    var A = this.anchor.elements, N = this.normal.elements;
    var dot = (A[0] - P[0]) * N[0] + (A[1] - P[1]) * N[1] + (A[2] - (P[2] || 0)) * N[2];
    return Vector.create([P[0] + N[0] * dot, P[1] + N[1] * dot, (P[2] || 0) + N[2] * dot]);
  },

  // Returns a copy of the plane, rotated by t radians about the given line
  // See notes on Line#rotate.
  rotate: function(t, line) {
    var R = Matrix.Rotation(t, line.direction).elements;
    var C = line.pointClosestTo(this.anchor).elements;
    var A = this.anchor.elements, N = this.normal.elements;
    var C1 = C[0], C2 = C[1], C3 = C[2], A1 = A[0], A2 = A[1], A3 = A[2];
    var x = A1 - C1, y = A2 - C2, z = A3 - C3;
    return Plane.create([
      C1 + R[0][0] * x + R[0][1] * y + R[0][2] * z,
      C2 + R[1][0] * x + R[1][1] * y + R[1][2] * z,
      C3 + R[2][0] * x + R[2][1] * y + R[2][2] * z
    ], [
      R[0][0] * N[0] + R[0][1] * N[1] + R[0][2] * N[2],
      R[1][0] * N[0] + R[1][1] * N[1] + R[1][2] * N[2],
      R[2][0] * N[0] + R[2][1] * N[1] + R[2][2] * N[2]
    ]);
  },

  // Returns the reflection of the plane in the given point, line or plane.
  reflectionIn: function(obj) {
    if (obj.normal) {
      // obj is a plane
      var A = this.anchor.elements, N = this.normal.elements;
      var A1 = A[0], A2 = A[1], A3 = A[2], N1 = N[0], N2 = N[1], N3 = N[2];
      var newA = this.anchor.reflectionIn(obj).elements;
      // Add the plane's normal to its anchor, then mirror that in the other plane
      var AN1 = A1 + N1, AN2 = A2 + N2, AN3 = A3 + N3;
      var Q = obj.pointClosestTo([AN1, AN2, AN3]).elements;
      var newN = [Q[0] + (Q[0] - AN1) - newA[0], Q[1] + (Q[1] - AN2) - newA[1], Q[2] + (Q[2] - AN3) - newA[2]];
      return Plane.create(newA, newN);
    } else if (obj.direction) {
      // obj is a line
      return this.rotate(Math.PI, obj);
    } else {
      // obj is a point
      var P = obj.elements || obj;
      return Plane.create(this.anchor.reflectionIn([P[0], P[1], (P[2] || 0)]), this.normal);
    }
  },

  // Sets the anchor point and normal to the plane. If three arguments are specified,
  // the normal is calculated by assuming the three points should lie in the same plane.
  // If only two are sepcified, the second is taken to be the normal. Normal vector is
  // normalised before storage.
  setVectors: function(anchor, v1, v2) {
    anchor = Vector.create(anchor);
    anchor = anchor.to3D(); if (anchor === null) { return null; }
    v1 = Vector.create(v1);
    v1 = v1.to3D(); if (v1 === null) { return null; }
    if (typeof(v2) == 'undefined') {
      v2 = null;
    } else {
      v2 = Vector.create(v2);
      v2 = v2.to3D(); if (v2 === null) { return null; }
    }
    var A1 = anchor.elements[0], A2 = anchor.elements[1], A3 = anchor.elements[2];
    var v11 = v1.elements[0], v12 = v1.elements[1], v13 = v1.elements[2];
    var normal, mod;
    if (v2 !== null) {
      var v21 = v2.elements[0], v22 = v2.elements[1], v23 = v2.elements[2];
      normal = Vector.create([
        (v12 - A2) * (v23 - A3) - (v13 - A3) * (v22 - A2),
        (v13 - A3) * (v21 - A1) - (v11 - A1) * (v23 - A3),
        (v11 - A1) * (v22 - A2) - (v12 - A2) * (v21 - A1)
      ]);
      mod = normal.modulus();
      if (mod === 0) { return null; }
      normal = Vector.create([normal.elements[0] / mod, normal.elements[1] / mod, normal.elements[2] / mod]);
    } else {
      mod = Math.sqrt(v11*v11 + v12*v12 + v13*v13);
      if (mod === 0) { return null; }
      normal = Vector.create([v1.elements[0] / mod, v1.elements[1] / mod, v1.elements[2] / mod]);
    }
    this.anchor = anchor;
    this.normal = normal;
    return this;
  }
};

// Constructor function
Plane.create = function(anchor, v1, v2) {
  var P = new Plane();
  return P.setVectors(anchor, v1, v2);
};

// X-Y-Z planes
Plane.XY = Plane.create(Vector.Zero(3), Vector.k);
Plane.YZ = Plane.create(Vector.Zero(3), Vector.i);
Plane.ZX = Plane.create(Vector.Zero(3), Vector.j);
Plane.YX = Plane.XY; Plane.ZY = Plane.YZ; Plane.XZ = Plane.ZX;

// Utility functions
var $V = Vector.create;
var $M = Matrix.create;
var $L = Line.create;
var $P = Plane.create;
/*!
 * jQuery 2d Transform v0.9.3
 * http://wiki.github.com/heygrady/transform/
 *
 * Copyright 2010, Grady Kuhnline
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 * 
 * Date: Sat Dec 4 15:46:09 2010 -0800
 */
///////////////////////////////////////////////////////
// Transform
///////////////////////////////////////////////////////
(function($, window, document, undefined) {
	/**
	 * @var Regex identify the matrix filter in IE
	 */
	var rmatrix = /progid:DXImageTransform\.Microsoft\.Matrix\(.*?\)/,
		rfxnum = /^([\+\-]=)?([\d+.\-]+)(.*)$/,
		rperc = /%/;
	
	// Steal some code from Modernizr
	var m = document.createElement( 'modernizr' ),
		m_style = m.style;
		
	function stripUnits(arg) {
		return parseFloat(arg);
	}
	
	/**
	 * Find the prefix that this browser uses
	 */	
	function getVendorPrefix() {
		var property = {
			transformProperty : '',
			MozTransform : '-moz-',
			WebkitTransform : '-webkit-',
			OTransform : '-o-',
			msTransform : '-ms-'
		};
		for (var p in property) {
			if (typeof m_style[p] != 'undefined') {
				return property[p];
			}
		}
		return null;
	}
	
	function supportCssTransforms() {
		if (typeof(window.Modernizr) !== 'undefined') {
			return Modernizr.csstransforms;
		}
		
		var props = [ 'transformProperty', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform' ];
		for ( var i in props ) {
			if ( m_style[ props[i] ] !== undefined  ) {
				return true;
			}
		}
	}
		
	// Capture some basic properties
	var vendorPrefix			= getVendorPrefix(),
		transformProperty		= vendorPrefix !== null ? vendorPrefix + 'transform' : false,
		transformOriginProperty	= vendorPrefix !== null ? vendorPrefix + 'transform-origin' : false;
	
	// store support in the jQuery Support object
	$.support.csstransforms = supportCssTransforms();
	
	// IE9 public preview 6 requires the DOM names
	if (vendorPrefix == '-ms-') {
		transformProperty = 'msTransform';
		transformOriginProperty = 'msTransformOrigin';
	}
	
	/**
	 * Class for creating cross-browser transformations
	 * @constructor
	 */
	$.extend({
		transform: function(elem) {
			// Cache the transform object on the element itself
			elem.transform = this;
			
			/**
			 * The element we're working with
			 * @var jQueryCollection
			 */
			this.$elem = $(elem);
						
			/**
			 * Remember the matrix we're applying to help the safeOuterLength func
			 */
			this.applyingMatrix = false;
			this.matrix = null;
			
			/**
			 * Remember the css height and width to save time
			 * This is only really used in IE
			 * @var Number
			 */
			this.height = null;
			this.width = null;
			this.outerHeight = null;
			this.outerWidth = null;
			
			/**
			 * We need to know the box-sizing in IE for building the outerHeight and outerWidth
			 * @var string
			 */
			this.boxSizingValue = null;
			this.boxSizingProperty = null;
			
			this.attr = null;
			this.transformProperty = transformProperty;
			this.transformOriginProperty = transformOriginProperty;
		}
	});
	
	$.extend($.transform, {
		/**
		 * @var Array list of all valid transform functions
		 */
		funcs: ['matrix', 'origin', 'reflect', 'reflectX', 'reflectXY', 'reflectY', 'rotate', 'scale', 'scaleX', 'scaleY', 'skew', 'skewX', 'skewY', 'translate', 'translateX', 'translateY']
	});
	
	/**
	 * Create Transform as a jQuery plugin
	 * @param Object funcs
	 * @param Object options
	 */
	$.fn.transform = function(funcs, options) {
		return this.each(function() {
			var t = this.transform || new $.transform(this);
			if (funcs) {
				t.exec(funcs, options);
			}
		});
	};
	
	$.transform.prototype = {
		/**
		 * Applies all of the transformations
		 * @param Object funcs
		 * @param Object options
		 * forceMatrix - uses the matrix in all browsers
		 * preserve - tries to preserve the values from previous runs
		 */
		exec: function(funcs, options) {
			// extend options
			options = $.extend(true, {
				forceMatrix: false,
				preserve: false
			}, options);
	
			// preserve the funcs from the previous run
			this.attr = null;
			if (options.preserve) {
				funcs = $.extend(true, this.getAttrs(true, true), funcs);
			} else {
				funcs = $.extend(true, {}, funcs); // copy the object to prevent weirdness
			}
			
			// Record the custom attributes on the element itself
			this.setAttrs(funcs);
			
			// apply the funcs
			if ($.support.csstransforms && !options.forceMatrix) {
				// CSS3 is supported
				return this.execFuncs(funcs);
			} else if ($.browser.msie || ($.support.csstransforms && options.forceMatrix)) {
				// Internet Explorer or Forced matrix
				return this.execMatrix(funcs);
			}
			return false;
		},
		
		/**
		 * Applies all of the transformations as functions
		 * @param Object funcs
		 */
		execFuncs: function(funcs) {
			var values = [];
			
			// construct a CSS string
			for (var func in funcs) {
				// handle origin separately
				if (func == 'origin') {
					this[func].apply(this, $.isArray(funcs[func]) ? funcs[func] : [funcs[func]]);
				} else if ($.inArray(func, $.transform.funcs) !== -1) {
					values.push(this.createTransformFunc(func, funcs[func]));
				}
			}
			this.$elem.css(transformProperty, values.join(' '));
			return true;
		},
		
		/**
		 * Applies all of the transformations as a matrix
		 * @param Object funcs
		 */
		execMatrix: function(funcs) {
			var matrix,
				tempMatrix,
				args;
			
			var elem = this.$elem[0],
				_this = this;
			function normalPixels(val, i) {
				if (rperc.test(val)) {
					// this really only applies to translation
					return parseFloat(val) / 100 * _this['safeOuter' + (i ? 'Height' : 'Width')]();
				}
				return toPx(elem, val);
			}
			
			var rtranslate = /translate[X|Y]?/,
				trans = [];
				
			for (var func in funcs) {
				switch ($.type(funcs[func])) {
					case 'array': args = funcs[func]; break;
					case 'string': args = $.map(funcs[func].split(','), $.trim); break;
					default: args = [funcs[func]];
				}
				
				if ($.matrix[func]) {
					
					if ($.cssAngle[func]) {
						// normalize on degrees
						args = $.map(args, $.angle.toDegree);						
					} else if (!$.cssNumber[func]) {
						// normalize to pixels
						args = $.map(args, normalPixels);
					} else {
						// strip units
						args = $.map(args, stripUnits);
					}
					
					tempMatrix = $.matrix[func].apply(this, args);
					if (rtranslate.test(func)) {
						//defer translation
						trans.push(tempMatrix);
					} else {
						matrix = matrix ? matrix.x(tempMatrix) : tempMatrix;
					}
				} else if (func == 'origin') {
					this[func].apply(this, args);
				}
			}
			
			// check that we have a matrix
			matrix = matrix || $.matrix.identity();
			
			// Apply translation
			$.each(trans, function(i, val) { matrix = matrix.x(val); });

			// pull out the relevant values
			var a = parseFloat(matrix.e(1,1).toFixed(6)),
				b = parseFloat(matrix.e(2,1).toFixed(6)),
				c = parseFloat(matrix.e(1,2).toFixed(6)),
				d = parseFloat(matrix.e(2,2).toFixed(6)),
				tx = matrix.rows === 3 ? parseFloat(matrix.e(1,3).toFixed(6)) : 0,
				ty = matrix.rows === 3 ? parseFloat(matrix.e(2,3).toFixed(6)) : 0;
			
			//apply the transform to the element
			if ($.support.csstransforms && vendorPrefix === '-moz-') {
				// -moz-
				this.$elem.css(transformProperty, 'matrix(' + a + ', ' + b + ', ' + c + ', ' + d + ', ' + tx + 'px, ' + ty + 'px)');
			} else if ($.support.csstransforms) {
				// -webkit, -o-, w3c
				// NOTE: WebKit and Opera don't allow units on the translate variables
				this.$elem.css(transformProperty, 'matrix(' + a + ', ' + b + ', ' + c + ', ' + d + ', ' + tx + ', ' + ty + ')');
			} else if ($.browser.msie) {
				// IE requires the special transform Filter
				
				//TODO: Use Nearest Neighbor during animation FilterType=\'nearest neighbor\'
				var filterType = ', FilterType=\'nearest neighbor\''; //bilinear
				var style = this.$elem[0].style;
				var matrixFilter = 'progid:DXImageTransform.Microsoft.Matrix(' +
						'M11=' + a + ', M12=' + c + ', M21=' + b + ', M22=' + d +
						', sizingMethod=\'auto expand\'' + filterType + ')';
				var filter = style.filter || $.curCSS( this.$elem[0], "filter" ) || "";
				style.filter = rmatrix.test(filter) ? filter.replace(rmatrix, matrixFilter) : filter ? filter + ' ' + matrixFilter : matrixFilter;
				
				// Let's know that we're applying post matrix fixes and the height/width will be static for a bit
				this.applyingMatrix = true;
				this.matrix = matrix;
				
				// IE can't set the origin or translate directly
				this.fixPosition(matrix, tx, ty);
				
				this.applyingMatrix = false;
				this.matrix = null;
			}
			return true;
		},
		
		/**
		 * Sets the transform-origin
		 * This really needs to be percentages
		 * @param Number x length
		 * @param Number y length
		 */
		origin: function(x, y) {
			// use CSS in supported browsers
			if ($.support.csstransforms) {
				if (typeof y === 'undefined') {
					this.$elem.css(transformOriginProperty, x);
				} else {
					this.$elem.css(transformOriginProperty, x + ' ' + y);
				}
				return true;
			}
			
			// correct for keyword lengths
			switch (x) {
				case 'left': x = '0'; break;
				case 'right': x = '100%'; break;
				case 'center': // no break
				case undefined: x = '50%';
			}
			switch (y) {
				case 'top': y = '0'; break;
				case 'bottom': y = '100%'; break;
				case 'center': // no break
				case undefined: y = '50%'; //TODO: does this work?
			}
			
			// store mixed values with units, assumed pixels
			this.setAttr('origin', [
				rperc.test(x) ? x : toPx(this.$elem[0], x) + 'px',
				rperc.test(y) ? y : toPx(this.$elem[0], y) + 'px'
			]);
			//console.log(this.getAttr('origin'));
			return true;
		},
		
		/**
		 * Create a function suitable for a CSS value
		 * @param string func
		 * @param Mixed value
		 */
		createTransformFunc: function(func, value) {
			if (func.substr(0, 7) === 'reflect') {
				// let's fake reflection, false value 
				// falsey sets an identity matrix
				var m = value ? $.matrix[func]() : $.matrix.identity();
				return 'matrix(' + m.e(1,1) + ', ' + m.e(2,1) + ', ' + m.e(1,2) + ', ' + m.e(2,2) + ', 0, 0)';
			}
			
			//value = _correctUnits(func, value);
			
			if (func == 'matrix') {
				if (vendorPrefix === '-moz-') {
					value[4] = value[4] ? value[4] + 'px' : 0;
					value[5] = value[5] ? value[5] + 'px' : 0;
				}
			}
			return func + '(' + ($.isArray(value) ? value.join(', ') : value) + ')';
		},
		
		/**
		 * @param Matrix matrix
		 * @param Number tx
		 * @param Number ty
		 * @param Number height
		 * @param Number width
		 */
		fixPosition: function(matrix, tx, ty, height, width) {
			// now we need to fix it!
			var	calc = new $.matrix.calc(matrix, this.safeOuterHeight(), this.safeOuterWidth()),
				origin = this.getAttr('origin'); // mixed percentages and px
			
			// translate a 0, 0 origin to the current origin
			var offset = calc.originOffset(new $.matrix.V2(
				rperc.test(origin[0]) ? parseFloat(origin[0])/100*calc.outerWidth : parseFloat(origin[0]),
				rperc.test(origin[1]) ? parseFloat(origin[1])/100*calc.outerHeight : parseFloat(origin[1])
			));
			
			// IE glues the top-most and left-most pixels of the transformed object to top/left of the original object
			//TODO: This seems wrong in the calculations
			var sides = calc.sides();

			// Protect against an item that is already positioned
			var cssPosition = this.$elem.css('position');
			if (cssPosition == 'static') {
				cssPosition = 'relative';
			}
			
			//TODO: if the element is already positioned, we should attempt to respect it (somehow)
			//NOTE: we could preserve our offset top and left in an attr on the elem
			var pos = {top: 0, left: 0};
			
			// Approximates transform-origin, tx, and ty
			var css = {
				'position': cssPosition,
				'top': (offset.top + ty + sides.top + pos.top) + 'px',
				'left': (offset.left + tx + sides.left + pos.left) + 'px',
				'zoom': 1
			};

			this.$elem.css(css);
		}
	};
	
	/**
	 * Ensure that values have the appropriate units on them
	 * @param string func
	 * @param Mixed value
	 */
	function toPx(elem, val) {
		var parts = rfxnum.exec($.trim(val));
		
		if (parts[3] && parts[3] !== 'px') {
			var prop = 'paddingBottom',
				orig = $.style( elem, prop );
				
			$.style( elem, prop, val );
			val = cur( elem, prop );
			$.style( elem, prop, orig );
			return val;
		}
		return parseFloat( val );
	}
	
	function cur(elem, prop) {
		if ( elem[prop] != null && (!elem.style || elem.style[prop] == null) ) {
			return elem[ prop ];
		}

		var r = parseFloat( $.css( elem, prop ) );
		return r && r > -10000 ? r : 0;
	}
})(jQuery, this, this.document);


///////////////////////////////////////////////////////
// Safe Outer Length
///////////////////////////////////////////////////////
(function($, window, document, undefined) {
	$.extend($.transform.prototype, {
		/**
		 * @param void
		 * @return Number
		 */
		safeOuterHeight: function() {
			return this.safeOuterLength('height');
		},
		
		/**
		 * @param void
		 * @return Number
		 */
		safeOuterWidth: function() {
			return this.safeOuterLength('width');
		},
		
		/**
		 * Returns reliable outer dimensions for an object that may have been transformed.
		 * Only use this if the matrix isn't handy
		 * @param String dim height or width
		 * @return Number
		 */
		safeOuterLength: function(dim) {
			var funcName = 'outer' + (dim == 'width' ? 'Width' : 'Height');
			
			if (!$.support.csstransforms && $.browser.msie) {
				// make the variables more generic
				dim = dim == 'width' ? 'width' : 'height';
				
				// if we're transforming and have a matrix; we can shortcut.
				// the true outerHeight is the transformed outerHeight divided by the ratio.
				// the ratio is equal to the height of a 1px by 1px box that has been transformed by the same matrix.
				if (this.applyingMatrix && !this[funcName] && this.matrix) {
					// calculate and return the correct size
					var calc = new $.matrix.calc(this.matrix, 1, 1),
						ratio = calc.offset(),
						length = this.$elem[funcName]() / ratio[dim];
					this[funcName] = length;
					
					return length;
				} else if (this.applyingMatrix && this[funcName]) {
					// return the cached calculation
					return this[funcName];
				}
				
				// map dimensions to box sides			
				var side = {
					height: ['top', 'bottom'],
					width: ['left', 'right']
				};
				
				// setup some variables
				var elem = this.$elem[0],
					outerLen = parseFloat($.curCSS(elem, dim, true)), //TODO: this can be cached on animations that do not animate height/width
					boxSizingProp = this.boxSizingProperty,
					boxSizingValue = this.boxSizingValue;
				
				// IE6 && IE7 will never have a box-sizing property, so fake it
				if (!this.boxSizingProperty) {
					boxSizingProp = this.boxSizingProperty = _findBoxSizingProperty() || 'box-sizing';
					boxSizingValue = this.boxSizingValue = this.$elem.css(boxSizingProp) || 'content-box';
				}
				
				// return it immediately if we already know it
				if (this[funcName] && this[dim] == outerLen) {
					return this[funcName];
				} else {
					this[dim] = outerLen;
				}
				
				// add in the padding and border
				if (boxSizingProp && (boxSizingValue == 'padding-box' || boxSizingValue == 'content-box')) {
					outerLen += parseFloat($.curCSS(elem, 'padding-' + side[dim][0], true)) || 0 +
								  parseFloat($.curCSS(elem, 'padding-' + side[dim][1], true)) || 0;
				}
				if (boxSizingProp && boxSizingValue == 'content-box') {
					outerLen += parseFloat($.curCSS(elem, 'border-' + side[dim][0] + '-width', true)) || 0 +
								  parseFloat($.curCSS(elem, 'border-' + side[dim][1] + '-width', true)) || 0;
				}
				
				// remember and return the outerHeight
				this[funcName] = outerLen;
				return outerLen;
			}
			return this.$elem[funcName]();
		}
	});
	
	/**
	 * Determine the correct property for checking the box-sizing property
	 * @param void
	 * @return string
	 */
	var _boxSizingProperty = null;
	function _findBoxSizingProperty () {
		if (_boxSizingProperty) {
			return _boxSizingProperty;
		} 
		
		var property = {
				boxSizing : 'box-sizing',
				MozBoxSizing : '-moz-box-sizing',
				WebkitBoxSizing : '-webkit-box-sizing',
				OBoxSizing : '-o-box-sizing'
			},
			elem = document.body;
		
		for (var p in property) {
			if (typeof elem.style[p] != 'undefined') {
				_boxSizingProperty = property[p];
				return _boxSizingProperty;
			}
		}
		return null;
	}
})(jQuery, this, this.document);


///////////////////////////////////////////////////////
// Attr
///////////////////////////////////////////////////////
(function($, window, document, undefined) {
	var rfuncvalue = /([\w\-]*?)\((.*?)\)/g, // with values
		attr = 'data-transform',
		rspace = /\s/,
		rcspace = /,\s?/;
	
	$.extend($.transform.prototype, {		
		/**
		 * This overrides all of the attributes
		 * @param Object funcs a list of transform functions to store on this element
		 * @return void
		 */
		setAttrs: function(funcs) {
			var string = '',
				value;
			for (var func in funcs) {
				value = funcs[func];
				if ($.isArray(value)) {
					value = value.join(', ');
				}
				string += ' ' + func + '(' + value + ')'; 
			}
			this.attr = $.trim(string);
			this.$elem.attr(attr, this.attr);
		},
		
		/**
		 * This sets only a specific atribute
		 * @param string func name of a transform function
		 * @param mixed value with proper units
		 * @return void
		 */
		setAttr: function(func, value) {
			// stringify the value
			if ($.isArray(value)) {
				value = value.join(', ');
			}
			
			// pull from a local variable to look it up
			var transform = this.attr || this.$elem.attr(attr);
			if (!transform || transform.indexOf(func) == -1) {
				// we don't have any existing values, save it
				// we don't have this function yet, save it
				this.attr = $.trim(transform + ' ' + func + '(' + value + ')');
				this.$elem.attr(attr, this.attr);
			} else {
				// replace the existing value
				var funcs = [],	parts;
				
				// regex split
				rfuncvalue.lastIndex = 0; // reset the regex pointer
				while (parts = rfuncvalue.exec(transform)) {
					if (func == parts[1]) {
						funcs.push(func + '(' + value + ')');
					} else {
						funcs.push(parts[0]);
					}
				}
				this.attr = funcs.join(' ');
				this.$elem.attr(attr, this.attr);
			}
		},
		
		/**
		 * @return Object
		 */
		getAttrs: function() {
			var transform = this.attr || this.$elem.attr(attr);
			if (!transform) {
				// We don't have any existing values, return empty object
				return {};
			}
			
			// replace the existing value
			var attrs = {}, parts, value;
			
			rfuncvalue.lastIndex = 0; // reset the regex pointer
			while ((parts = rfuncvalue.exec(transform)) !== null) {
				if (parts) {
					value = parts[2].split(rcspace);
					attrs[parts[1]] = value.length == 1 ? value[0] : value;
				}
			}
			return attrs;
		},
		
		/**
		 * @param String func 
		 * @return mixed
		 */
		getAttr: function(func) {
			var attrs = this.getAttrs();
			if (typeof attrs[func] !== 'undefined') {
				return attrs[func];
			}
			
			//TODO: move the origin to a function
			if (func === 'origin' && $.support.csstransforms) {
				// supported browsers return percentages always
				return this.$elem.css(this.transformOriginProperty).split(rspace);
			} else if (func === 'origin') {
				// just force IE to also return a percentage
				return ['50%', '50%'];
			}
			
			return $.cssDefault[func] || 0;
		}
	});
	
	// Define 
	if (typeof($.cssAngle) == 'undefined') {
		$.cssAngle = {};
	}
	$.extend($.cssAngle, {
		rotate: true,
		skew: true,
		skewX: true,
		skewY: true
	});
	
	// Define default values
	if (typeof($.cssDefault) == 'undefined') {
		$.cssDefault = {};
	}
	
	$.extend($.cssDefault, {
		scale: [1, 1],
		scaleX: 1,
		scaleY: 1,
		matrix: [1, 0, 0, 1, 0, 0],
		origin: ['50%', '50%'], // TODO: allow this to be a function, like get
		reflect: [1, 0, 0, 1, 0, 0],
		reflectX: [1, 0, 0, 1, 0, 0],
		reflectXY: [1, 0, 0, 1, 0, 0],
		reflectY: [1, 0, 0, 1, 0, 0]
	});
	
	// Define functons with multiple values
	if (typeof($.cssMultipleValues) == 'undefined') {
		$.cssMultipleValues = {};
	}
	$.extend($.cssMultipleValues, {
		matrix: 6,
		origin: {
			length: 2,
			duplicate: true
		},
		reflect: 6,
		reflectX: 6,
		reflectXY: 6,
		reflectY: 6,
		scale: {
			length: 2,
			duplicate: true
		},
		skew: 2,
		translate: 2
	});
	
	// specify unitless funcs
	$.extend($.cssNumber, {
		matrix: true,
		reflect: true,
		reflectX: true,
		reflectXY: true,
		reflectY: true,
		scale: true,
		scaleX: true,
		scaleY: true
	});
	
	// override all of the css functions
	$.each($.transform.funcs, function(i, func) {
		$.cssHooks[func] = {
			set: function(elem, value) {
				var transform = elem.transform || new $.transform(elem),
					funcs = {};
				funcs[func] = value;
				transform.exec(funcs, {preserve: true});
			},
			get: function(elem, computed) {
				var transform = elem.transform || new $.transform(elem);
				return transform.getAttr(func);
			}
		};
	});
	
	// Support Reflection animation better by returning a matrix
	$.each(['reflect', 'reflectX', 'reflectXY', 'reflectY'], function(i, func) {
		$.cssHooks[func].get = function(elem, computed) {
			var transform = elem.transform || new $.transform(elem);
			return transform.getAttr('matrix') || $.cssDefault[func];
		};
	});
})(jQuery, this, this.document);
///////////////////////////////////////////////////////
// Animation
///////////////////////////////////////////////////////
(function($, window, document, undefined) {
	/**
	 * @var Regex looks for units on a string
	 */
	var rfxnum = /^([+\-]=)?([\d+.\-]+)(.*)$/;
	
	/**
	 * Doctors prop values in the event that they contain spaces
	 * @param Object prop
	 * @param String speed
	 * @param String easing
	 * @param Function callback
	 * @return bool
	 */
	var _animate = $.fn.animate;
	$.fn.animate = function( prop, speed, easing, callback ) {
		var optall = $.speed(speed, easing, callback),
			mv = $.cssMultipleValues;
		
		// Speed always creates a complete function that must be reset
		optall.complete = optall.old;
		
		// Capture multiple values
		if (!$.isEmptyObject(prop)) {
			if (typeof optall.original === 'undefined') {
				optall.original = {};
			}
			$.each( prop, function( name, val ) {
				if (mv[name]
					|| $.cssAngle[name]
					|| (!$.cssNumber[name] && $.inArray(name, $.transform.funcs) !== -1)) {
					
					// Handle special easing
					var specialEasing = null;
					if (jQuery.isArray(prop[name])) {
						var mvlen = 1, len = val.length;
						if (mv[name]) {
							mvlen = (typeof mv[name].length === 'undefined' ? mv[name] : mv[name].length);
						}
						if ( len > mvlen
							|| (len < mvlen && len == 2)
							|| (len == 2 && mvlen == 2 && isNaN(parseFloat(val[len - 1])))) {
							
							specialEasing = val[len - 1];
							val.splice(len - 1, 1);
						}
					}
					
					// Store the original values onto the optall
					optall.original[name] = val.toString();
					
					// reduce to a unitless number (to trick animate)
					prop[name] = parseFloat(val);
				}
			} );
		}
		
		//NOTE: we edited prop above to trick animate
		//NOTE: we pre-convert to an optall so we can doctor it
		return _animate.apply(this, [arguments[0], optall]);
	};
	
	var prop = 'paddingBottom';
	function cur(elem, prop) {
		if ( elem[prop] != null && (!elem.style || elem.style[prop] == null) ) {
			//return elem[ prop ];
		}

		var r = parseFloat( $.css( elem, prop ) );
		return r && r > -10000 ? r : 0;
	}
	
	var _custom = $.fx.prototype.custom;
	$.fx.prototype.custom = function(from, to, unit) {
		var multiple = $.cssMultipleValues[this.prop],
			angle = $.cssAngle[this.prop];
		
		//TODO: simply check for the existence of CSS Hooks?
		if (multiple || (!$.cssNumber[this.prop] && $.inArray(this.prop, $.transform.funcs) !== -1)) {
			this.values = [];
			
			if (!multiple) {
				multiple = 1;
			}
			
			// Pull out the known values
			var values = this.options.original[this.prop],
				currentValues = $(this.elem).css(this.prop),
				defaultValues = $.cssDefault[this.prop] || 0;
			
			// make sure the current css value is an array
			if (!$.isArray(currentValues)) {
				currentValues = [currentValues];
			}
			
			// make sure the new values are an array
			if (!$.isArray(values)) {
				if ($.type(values) === 'string') {
					values = values.split(',');
				} else {
					values = [values];
				}
			}
			
			// make sure we have enough new values
			var length = multiple.length || multiple, i = 0;
			while (values.length < length) {
				values.push(multiple.duplicate ? values[0] : defaultValues[i] || 0);
				i++;
			}
			
			// calculate a start, end and unit for each new value
			var start, parts, end, //unit,
				fx = this,
				transform = fx.elem.transform;
				orig = $.style(fx.elem, prop);

			$.each(values, function(i, val) {
				// find a sensible start value
				if (currentValues[i]) {
					start = currentValues[i];
				} else if (defaultValues[i] && !multiple.duplicate) {
					start = defaultValues[i];
				} else if (multiple.duplicate) {
					start = currentValues[0];
				} else {
					start = 0;
				}
				
				// Force the correct unit on the start
				if (angle) {
					start = $.angle.toDegree(start);
				} else if (!$.cssNumber[fx.prop]) {
					parts = rfxnum.exec($.trim(start));
					if (parts[3] && parts[3] !== 'px') {
						if (parts[3] === '%') {
							start = parseFloat( parts[2] ) / 100 * transform['safeOuter' + (i ? 'Height' : 'Width')]();
						} else {
							$.style( fx.elem, prop, start);
							start = cur(fx.elem, prop);
							$.style( fx.elem, prop, orig);
						}
					}
				}
				start = parseFloat(start);
				
				// parse the value with a regex
				parts = rfxnum.exec($.trim(val));
				
				if (parts) {
					// we found a sensible value and unit
					end = parseFloat( parts[2] );
					unit = parts[3] || "px"; //TODO: change to an appropriate default unit
					
					if (angle) {
						end = $.angle.toDegree(end + unit);
						unit = 'deg';
					} else if (!$.cssNumber[fx.prop] && unit === '%') {
						start = (start / transform['safeOuter' + (i ? 'Height' : 'Width')]()) * 100;
					} else if (!$.cssNumber[fx.prop] && unit !== 'px') {
						$.style( fx.elem, prop, (end || 1) + unit);
						start = ((end || 1) / cur(fx.elem, prop)) * start;
						$.style( fx.elem, prop, orig);
					}
					
					// If a +=/-= token was provided, we're doing a relative animation
					if (parts[1]) {
						end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
					}
				} else {
					// I don't know when this would happen
					end = val;
					unit = ''; 
				}
								
				// Save the values
				fx.values.push({
					start: start,
					end: end,
					unit: unit
				});				
			});
		}
		return _custom.apply(this, arguments);
	};
	
	/**
	 * Animates a multi value attribute
	 * @param Object fx
	 * @return null
	 */
	$.fx.multipleValueStep = {
		_default: function(fx) {
			$.each(fx.values, function(i, val) {
				fx.values[i].now = val.start + ((val.end - val.start) * fx.pos);
			});
		}
	};
	$.each(['matrix', 'reflect', 'reflectX', 'reflectXY', 'reflectY'], function(i, func) {
		$.fx.multipleValueStep[func] = function(fx) {
			var d = fx.decomposed,
				$m = $.matrix;
				m = $m.identity();
			
			d.now = {};
			
			// increment each part of the decomposition and recompose it		
			$.each(d.start, function(k) {				
				// calculate the current value
				d.now[k] = parseFloat(d.start[k]) + ((parseFloat(d.end[k]) - parseFloat(d.start[k])) * fx.pos);
				
				// skip functions that won't affect the transform
				if (((k === 'scaleX' || k === 'scaleY') && d.now[k] === 1) ||
					(k !== 'scaleX' && k !== 'scaleY' && d.now[k] === 0)) {
					return true;
				}
				
				// calculating
				m = m.x($m[k](d.now[k]));
			});
			
			// save the correct matrix values for the value of now
			var val;
			$.each(fx.values, function(i) {
				switch (i) {
					case 0: val = parseFloat(m.e(1, 1).toFixed(6)); break;
					case 1: val = parseFloat(m.e(2, 1).toFixed(6)); break;
					case 2: val = parseFloat(m.e(1, 2).toFixed(6)); break;
					case 3: val = parseFloat(m.e(2, 2).toFixed(6)); break;
					case 4: val = parseFloat(m.e(1, 3).toFixed(6)); break;
					case 5: val = parseFloat(m.e(2, 3).toFixed(6)); break;
				}
				fx.values[i].now = val;
			});
		};
	});
	/**
	 * Step for animating tranformations
	 */
	$.each($.transform.funcs, function(i, func) {
		$.fx.step[func] = function(fx) {
			var transform = fx.elem.transform || new $.transform(fx.elem),
				funcs = {};
			
			if ($.cssMultipleValues[func] || (!$.cssNumber[func] && $.inArray(func, $.transform.funcs) !== -1)) {
				($.fx.multipleValueStep[fx.prop] || $.fx.multipleValueStep._default)(fx);
				funcs[fx.prop] = [];
				$.each(fx.values, function(i, val) {
					funcs[fx.prop].push(val.now + ($.cssNumber[fx.prop] ? '' : val.unit));
				});
			} else {
				funcs[fx.prop] = fx.now + ($.cssNumber[fx.prop] ? '' : fx.unit);
			}
			
			transform.exec(funcs, {preserve: true});
		};
	});
	
	// Support matrix animation
	$.each(['matrix', 'reflect', 'reflectX', 'reflectXY', 'reflectY'], function(i, func) {
		$.fx.step[func] = function(fx) {
			var transform = fx.elem.transform || new $.transform(fx.elem),
				funcs = {};
				
			if (!fx.initialized) {
				fx.initialized = true;

				// Reflections need a sensible end value set
				if (func !== 'matrix') {
					var values = $.matrix[func]().elements;
					var val;
					$.each(fx.values, function(i) {
						switch (i) {
							case 0: val = values[0]; break;
							case 1: val = values[2]; break;
							case 2: val = values[1]; break;
							case 3: val = values[3]; break;
							default: val = 0;
						}
						fx.values[i].end = val;
					});
				}
				
				// Decompose the start and end
				fx.decomposed = {};
				var v = fx.values;
				
				fx.decomposed.start = $.matrix.matrix(v[0].start, v[1].start, v[2].start, v[3].start, v[4].start, v[5].start).decompose();
				fx.decomposed.end = $.matrix.matrix(v[0].end, v[1].end, v[2].end, v[3].end, v[4].end, v[5].end).decompose();
			}
			
			($.fx.multipleValueStep[fx.prop] || $.fx.multipleValueStep._default)(fx);
			funcs.matrix = [];
			$.each(fx.values, function(i, val) {
				funcs.matrix.push(val.now);
			});
			
			transform.exec(funcs, {preserve: true});
		};
	});
})(jQuery, this, this.document);
///////////////////////////////////////////////////////
// Angle
///////////////////////////////////////////////////////
(function($, window, document, undefined) {
	/**
	 * Converting a radian to a degree
	 * @const
	 */
	var RAD_DEG = 180/Math.PI;
	
	/**
	 * Converting a radian to a grad
	 * @const
	 */
	var RAD_GRAD = 200/Math.PI;
	
	/**
	 * Converting a degree to a radian
	 * @const
	 */
	var DEG_RAD = Math.PI/180;
	
	/**
	 * Converting a degree to a grad
	 * @const
	 */
	var DEG_GRAD = 2/1.8;
	
	/**
	 * Converting a grad to a degree
	 * @const
	 */
	var GRAD_DEG = 0.9;
	
	/**
	 * Converting a grad to a radian
	 * @const
	 */
	var GRAD_RAD = Math.PI/200;
	
	
	var rfxnum = /^([+\-]=)?([\d+.\-]+)(.*)$/;
	
	/**
	 * Functions for converting angles
	 * @var Object
	 */
	$.extend({
		angle: {
			/**
			 * available units for an angle
			 * @var Regex
			 */
			runit: /(deg|g?rad)/,
			
			/**
			 * Convert a radian into a degree
			 * @param Number rad
			 * @return Number
			 */
			radianToDegree: function(rad) {
				return rad * RAD_DEG;
			},
			
			/**
			 * Convert a radian into a degree
			 * @param Number rad
			 * @return Number
			 */
			radianToGrad: function(rad) {
				return rad * RAD_GRAD;
			},
			
			/**
			 * Convert a degree into a radian
			 * @param Number deg
			 * @return Number
			 */
			degreeToRadian: function(deg) {
				return deg * DEG_RAD;
			},
			
			/**
			 * Convert a degree into a radian
			 * @param Number deg
			 * @return Number
			 */
			degreeToGrad: function(deg) {
				return deg * DEG_GRAD;
			},
			
			/**
			 * Convert a grad into a degree
			 * @param Number grad
			 * @return Number
			 */
			gradToDegree: function(grad) {
				return grad * GRAD_DEG;
			},
			
			/**
			 * Convert a grad into a radian
			 * @param Number grad
			 * @return Number
			 */
			gradToRadian: function(grad) {
				return grad * GRAD_RAD;
			},
			
			/**
			 * Convert an angle with a unit to a degree
			 * @param String val angle with a unit
			 * @return Number
			 */
			toDegree: function (val) {
				var parts = rfxnum.exec(val);
				if (parts) {
					val = parseFloat( parts[2] );
					switch (parts[3] || 'deg') {
						case 'grad':
							val = $.angle.gradToDegree(val);
							break;
						case 'rad':
							val = $.angle.radianToDegree(val);
							break;
					}
					return val;
				}
				return 0;
			}
		}
	});
})(jQuery, this, this.document);
///////////////////////////////////////////////////////
// Matrix
///////////////////////////////////////////////////////
(function($, window, document, undefined) {
	/**
	 * Matrix object for creating matrices relevant for 2d Transformations
	 * @var Object
	 */
	if (typeof($.matrix) == 'undefined') {
		$.extend({
			matrix: {}
		});
	}
	var $m = $.matrix;
	
	$.extend( $m, {
		/**
		 * A 2-value vector
		 * @param Number x
		 * @param Number y
		 * @constructor
		 */
		V2: function(x, y){
			if ($.isArray(arguments[0])) {
				this.elements = arguments[0].slice(0, 2);
			} else {
				this.elements = [x, y];
			}
			this.length = 2;
		},
		
		/**
		 * A 2-value vector
		 * @param Number x
		 * @param Number y
		 * @param Number z
		 * @constructor
		 */
		V3: function(x, y, z){
			if ($.isArray(arguments[0])) {
				this.elements = arguments[0].slice(0, 3);
			} else {
				this.elements = [x, y, z];
			}
			this.length = 3;
		},
		
		/**
		 * A 2x2 Matrix, useful for 2D-transformations without translations
		 * @param Number mn
		 * @constructor
		 */
		M2x2: function(m11, m12, m21, m22) {
			if ($.isArray(arguments[0])) {
				this.elements = arguments[0].slice(0, 4);
			} else {
				this.elements = Array.prototype.slice.call(arguments).slice(0, 4);
			}
			this.rows = 2;
			this.cols = 2;
		},
		
		/**
		 * A 3x3 Matrix, useful for 3D-transformations without translations
		 * @param Number mn
		 * @constructor
		 */
		M3x3: function(m11, m12, m13, m21, m22, m23, m31, m32, m33) {
			if ($.isArray(arguments[0])) {
				this.elements = arguments[0].slice(0, 9);
			} else {
				this.elements = Array.prototype.slice.call(arguments).slice(0, 9);
			}
			this.rows = 3;
			this.cols = 3;
		}
	});
	
	/** generic matrix prototype */
	var Matrix = {
		/**
		 * Return a specific element from the matrix
		 * @param Number row where 1 is the 0th row
		 * @param Number col where 1 is the 0th column
		 * @return Number
		 */
		e: function(row, col) {
			var rows = this.rows,
				cols = this.cols;
			
			// return 0 on nonsense rows and columns
			if (row > rows || col > rows || row < 1 || col < 1) {
				return 0;
			}
			
			return this.elements[(row - 1) * cols + col - 1];
		},
		
		/**
		 * Taken from Zoomooz
	     * https://github.com/jaukia/zoomooz/blob/c7a37b9a65a06ba730bd66391bbd6fe8e55d3a49/js/jquery.zoomooz.js
		 */
		decompose: function() {
			var a = this.e(1, 1),
				b = this.e(2, 1),
				c = this.e(1, 2),
				d = this.e(2, 2),
				e = this.e(1, 3),
				f = this.e(2, 3);
				
			// In case the matrix can't be decomposed
			if (Math.abs(a * d - b * c) < 0.01) {
				return {
					rotate: 0 + 'deg',
					skewX: 0 + 'deg',
					scaleX: 1,
					scaleY: 1,
					translateX: 0 + 'px',
					translateY: 0 + 'px'
				};
			}
			
			// Translate is easy
			var tx = e, ty = f;
			
			// factor out the X scale
			var sx = Math.sqrt(a * a + b * b);
			a = a/sx;
			b = b/sx;
			
			// factor out the skew
			var k = a * c + b * d;
			c -= a * k;
			d -= b * k;
			
			// factor out the Y scale
			var sy = Math.sqrt(c * c + d * d);
			c = c / sy;
			d = d / sy;
			k = k / sy;
			
			// account for negative scale
			if ((a * d - b * c) < 0.0) {
				a = -a;
				b = -b;
				//c = -c; // accomplishes nothing to negate it
				//d = -d; // accomplishes nothing to negate it
				sx = -sx;
				//sy = -sy //Scale Y shouldn't ever be negated
			}
			
			// calculate the rotation angle and skew angle
			var rad2deg = $.angle.radianToDegree;
			var r = rad2deg(Math.atan2(b, a));
			k = rad2deg(Math.atan(k));
			
			return {
				rotate: r + 'deg',
				skewX: k + 'deg',
				scaleX: sx,
				scaleY: sy,
				translateX: tx + 'px',
				translateY: ty + 'px'
			};
		}
	};
	
	/** Extend all of the matrix types with the same prototype */
	$.extend($m.M2x2.prototype, Matrix, {
		toM3x3: function() {
			var a = this.elements;
			return new $m.M3x3(
				a[0], a[1], 0,
				a[2], a[3], 0,
				0,    0,    1
			);	
		},
		
		/**
		 * Multiply a 2x2 matrix by a similar matrix or a vector
		 * @param M2x2 | V2 matrix
		 * @return M2x2 | V2
		 */
		x: function(matrix) {
			var isVector = typeof(matrix.rows) === 'undefined';
			
			// Ensure the right-sized matrix
			if (!isVector && matrix.rows == 3) {
				return this.toM3x3().x(matrix);
			}
			
			var a = this.elements,
				b = matrix.elements;
			
			if (isVector && b.length == 2) {
				// b is actually a vector
				return new $m.V2(
					a[0] * b[0] + a[1] * b[1],
					a[2] * b[0] + a[3] * b[1]
				);
			} else if (b.length == a.length) {
				// b is a 2x2 matrix
				return new $m.M2x2(
					a[0] * b[0] + a[1] * b[2],
					a[0] * b[1] + a[1] * b[3],
					
					a[2] * b[0] + a[3] * b[2],
					a[2] * b[1] + a[3] * b[3]
				);
			}
			return false; // fail
		},
		
		/**
		 * Generates an inverse of the current matrix
		 * @param void
		 * @return M2x2
		 * @link http://www.dr-lex.be/random/matrix_inv.html
		 */
		inverse: function() {
			var d = 1/this.determinant(),
				a = this.elements;
			return new $m.M2x2(
				d *  a[3], d * -a[1],
				d * -a[2], d *  a[0]
			);
		},
		
		/**
		 * Calculates the determinant of the current matrix
		 * @param void
		 * @return Number
		 * @link http://www.dr-lex.be/random/matrix_inv.html
		 */
		determinant: function() {
			var a = this.elements;
			return a[0] * a[3] - a[1] * a[2];
		}
	});
	
	$.extend($m.M3x3.prototype, Matrix, {
		/**
		 * Multiply a 3x3 matrix by a similar matrix or a vector
		 * @param M3x3 | V3 matrix
		 * @return M3x3 | V3
		 */
		x: function(matrix) {
			var isVector = typeof(matrix.rows) === 'undefined';
			
			// Ensure the right-sized matrix
			if (!isVector && matrix.rows < 3) {
				matrix = matrix.toM3x3();
			}
			
			var a = this.elements,
				b = matrix.elements;
			
			if (isVector && b.length == 3) {
				// b is actually a vector
				return new $m.V3(
					a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
					a[3] * b[0] + a[4] * b[1] + a[5] * b[2],
					a[6] * b[0] + a[7] * b[1] + a[8] * b[2]
				);
			} else if (b.length == a.length) {
				// b is a 3x3 matrix
				return new $m.M3x3(
					a[0] * b[0] + a[1] * b[3] + a[2] * b[6],
					a[0] * b[1] + a[1] * b[4] + a[2] * b[7],
					a[0] * b[2] + a[1] * b[5] + a[2] * b[8],

					a[3] * b[0] + a[4] * b[3] + a[5] * b[6],
					a[3] * b[1] + a[4] * b[4] + a[5] * b[7],
					a[3] * b[2] + a[4] * b[5] + a[5] * b[8],

					a[6] * b[0] + a[7] * b[3] + a[8] * b[6],
					a[6] * b[1] + a[7] * b[4] + a[8] * b[7],
					a[6] * b[2] + a[7] * b[5] + a[8] * b[8]
				);
			}
			return false; // fail
		},
		
		/**
		 * Generates an inverse of the current matrix
		 * @param void
		 * @return M3x3
		 * @link http://www.dr-lex.be/random/matrix_inv.html
		 */
		inverse: function() {
			var d = 1/this.determinant(),
				a = this.elements;
			return new $m.M3x3(
				d * (  a[8] * a[4] - a[7] * a[5]),
				d * (-(a[8] * a[1] - a[7] * a[2])),
				d * (  a[5] * a[1] - a[4] * a[2]),
				
				d * (-(a[8] * a[3] - a[6] * a[5])),
				d * (  a[8] * a[0] - a[6] * a[2]),
				d * (-(a[5] * a[0] - a[3] * a[2])),
				
				d * (  a[7] * a[3] - a[6] * a[4]),
				d * (-(a[7] * a[0] - a[6] * a[1])),
				d * (  a[4] * a[0] - a[3] * a[1])
			);
		},
		
		/**
		 * Calculates the determinant of the current matrix
		 * @param void
		 * @return Number
		 * @link http://www.dr-lex.be/random/matrix_inv.html
		 */
		determinant: function() {
			var a = this.elements;
			return a[0] * (a[8] * a[4] - a[7] * a[5]) - a[3] * (a[8] * a[1] - a[7] * a[2]) + a[6] * (a[5] * a[1] - a[4] * a[2]);
		}
	});
	
	/** generic vector prototype */
	var Vector = {		
		/**
		 * Return a specific element from the vector
		 * @param Number i where 1 is the 0th value
		 * @return Number
		 */
		e: function(i) {
			return this.elements[i - 1];
		}
	};
	
	/** Extend all of the vector types with the same prototype */
	$.extend($m.V2.prototype, Vector);
	$.extend($m.V3.prototype, Vector);
})(jQuery, this, this.document);
///////////////////////////////////////////////////////
// Matrix Calculations
///////////////////////////////////////////////////////
(function($, window, document, undefined) {
	/**
	 * Matrix object for creating matrices relevant for 2d Transformations
	 * @var Object
	 */
	if (typeof($.matrix) == 'undefined') {
		$.extend({
			matrix: {}
		});
	}
	
	$.extend( $.matrix, {
		/**
		 * Class for calculating coordinates on a matrix
		 * @param Matrix matrix
		 * @param Number outerHeight
		 * @param Number outerWidth
		 * @constructor
		 */
		calc: function(matrix, outerHeight, outerWidth) {
			/**
			 * @var Matrix
			 */
			this.matrix = matrix;
			
			/**
			 * @var Number
			 */
			this.outerHeight = outerHeight;
			
			/**
			 * @var Number
			 */
			this.outerWidth = outerWidth;
		}
	});
	
	$.matrix.calc.prototype = {
		/**
		 * Calculate a coord on the new object
		 * @return Object
		 */
		coord: function(x, y, z) {
			//default z and w
			z = typeof(z) !== 'undefined' ? z : 0;
			
			var matrix = this.matrix,
				vector;
				
			switch (matrix.rows) {
				case 2:
					vector = matrix.x(new $.matrix.V2(x, y));
					break;
				case 3:
					vector = matrix.x(new $.matrix.V3(x, y, z));
					break;
			}
			
			return vector;
		},
		
		/**
		 * Calculate the corners of the new object
		 * @return Object
		 */
		corners: function(x, y) {
			// Try to save the corners if this is called a lot
			var save = !(typeof(x) !=='undefined' || typeof(y) !=='undefined'),
				c;
			if (!this.c || !save) {
				y = y || this.outerHeight;
				x = x || this.outerWidth;
				
				c = {
					tl: this.coord(0, 0),
					bl: this.coord(0, y),
					tr: this.coord(x, 0),
					br: this.coord(x, y)
				};
			} else {
				c = this.c;
			}
			
			if (save) {
				this.c = c;
			}
			return c;
		},
		
		/**
		 * Calculate the sides of the new object
		 * @return Object
		 */
		sides: function(corners) {
			// The corners of the box
			var c = corners || this.corners();
			
			return {
				top: Math.min(c.tl.e(2), c.tr.e(2), c.br.e(2), c.bl.e(2)),
				bottom: Math.max(c.tl.e(2), c.tr.e(2), c.br.e(2), c.bl.e(2)),
				left: Math.min(c.tl.e(1), c.tr.e(1), c.br.e(1), c.bl.e(1)),
				right: Math.max(c.tl.e(1), c.tr.e(1), c.br.e(1), c.bl.e(1))
			};
		},
		
		/**
		 * Calculate the offset of the new object
		 * @return Object
		 */
		offset: function(corners) {
			// The corners of the box
			var s = this.sides(corners);
			
			// return size
			return {
				height: Math.abs(s.bottom - s.top), 
				width: Math.abs(s.right - s.left)
			};
		},
		
		/**
		 * Calculate the area of the new object
		 * @return Number
		 * @link http://en.wikipedia.org/wiki/Quadrilateral#Area_of_a_convex_quadrilateral
		 */
		area: function(corners) {
			// The corners of the box
			var c = corners || this.corners();
			
			// calculate the two diagonal vectors
			var v1 = {
					x: c.tr.e(1) - c.tl.e(1) + c.br.e(1) - c.bl.e(1),
					y: c.tr.e(2) - c.tl.e(2) + c.br.e(2) - c.bl.e(2)
				},
				v2 = {
					x: c.bl.e(1) - c.tl.e(1) + c.br.e(1) - c.tr.e(1),
					y: c.bl.e(2) - c.tl.e(2) + c.br.e(2) - c.tr.e(2)
				};
				
			return 0.25 * Math.abs(v1.e(1) * v2.e(2) - v1.e(2) * v2.e(1));
		},
		
		/**
		 * Calculate the non-affinity of the new object
		 * @return Number
		 */
		nonAffinity: function() {
			// The corners of the box
			var sides = this.sides(),
				xDiff = sides.top - sides.bottom,
				yDiff = sides.left - sides.right;
			
			return parseFloat(parseFloat(Math.abs(
				(Math.pow(xDiff, 2) + Math.pow(yDiff, 2)) /
				(sides.top * sides.bottom + sides.left * sides.right)
			)).toFixed(8));
		},
		
		/**
		 * Calculate a proper top and left for IE
		 * @param Object toOrigin
		 * @param Object fromOrigin
		 * @return Object
		 */
		originOffset: function(toOrigin, fromOrigin) {
			// the origin to translate to
			toOrigin = toOrigin ? toOrigin : new $.matrix.V2(
				this.outerWidth * 0.5,
				this.outerHeight * 0.5
			);
			
			// the origin to translate from (IE has a fixed origin of 0, 0)
			fromOrigin = fromOrigin ? fromOrigin : new $.matrix.V2(
				0,
				0
			);
			
			// transform the origins
			var toCenter = this.coord(toOrigin.e(1), toOrigin.e(2));
			var fromCenter = this.coord(fromOrigin.e(1), fromOrigin.e(2));
			
			// return the offset
			return {
				top: (fromCenter.e(2) - fromOrigin.e(2)) - (toCenter.e(2) - toOrigin.e(2)),
				left: (fromCenter.e(1) - fromOrigin.e(1)) - (toCenter.e(1) - toOrigin.e(1))
			};
		}
	};
})(jQuery, this, this.document);
///////////////////////////////////////////////////////
// 2d Matrix Functions
///////////////////////////////////////////////////////
(function($, window, document, undefined) {
	/**
	 * Matrix object for creating matrices relevant for 2d Transformations
	 * @var Object
	 */
	if (typeof($.matrix) == 'undefined') {
		$.extend({
			matrix: {}
		});
	}
	var $m = $.matrix,
		$m2x2 = $m.M2x2,
		$m3x3 = $m.M3x3;
	
	$.extend( $m, {
		/**
		 * Identity matrix
		 * @param Number size
		 * @return Matrix
		 */
		identity: function(size) {
			size = size || 2;
			var length = size * size,
				elements = new Array(length),
				mod = size + 1;
			for (var i = 0; i < length; i++) {
				elements[i] = (i % mod) === 0 ? 1 : 0;
			}
			return new $m['M'+size+'x'+size](elements);
		},
		
		/**
		 * Matrix
		 * @return Matrix
		 */
		matrix: function() {
			var args = Array.prototype.slice.call(arguments);
			// arguments are in column-major order
			switch (arguments.length) {
				case 4:
					return new $m2x2(
						args[0], args[2],
						args[1], args[3]
					);
				case 6:
					return new $m3x3(
						args[0], args[2], args[4],
						args[1], args[3], args[5],
						0,       0,       1
					);
			}
		},
		
		/**
		 * Reflect (same as rotate(180))
		 * @return Matrix
		 */
		reflect: function() {
			return new $m2x2(
				-1,  0,
				 0, -1
			);
		},
		
		/**
		 * Reflect across the x-axis (mirrored upside down)
		 * @return Matrix
		 */
		reflectX: function() {	
			return new $m2x2(
				1,  0,
				0, -1
			);
		},
		
		/**
		 * Reflect by swapping x an y (same as reflectX + rotate(-90))
		 * @return Matrix
		 */
		reflectXY: function() {
			return new $m2x2(
				0, 1,
				1, 0
			);
		},
		
		/**
		 * Reflect across the y-axis (mirrored)
		 * @return Matrix
		 */
		reflectY: function() {
			return new $m2x2(
				-1, 0,
				 0, 1
			);
		},
		
		/**
		 * Rotates around the origin
		 * @param Number deg
		 * @return Matrix
		 * @link http://www.w3.org/TR/SVG/coords.html#RotationDefined
		 */
		rotate: function(deg) {
			//TODO: detect units
			var rad = $.angle.degreeToRadian(deg),
				costheta = Math.cos(rad),
				sintheta = Math.sin(rad);
			
			var a = costheta,
				b = sintheta,
				c = -sintheta,
				d = costheta;
				
			return new $m2x2(
				a, c,
				b, d
			);
		},
		
		/**
		 * Scale
		 * @param Number sx
		 * @param Number sy
		 * @return Matrix
		 * @link http://www.w3.org/TR/SVG/coords.html#ScalingDefined
		 */
		scale: function (sx, sy) {
			sx = sx || sx === 0 ? sx : 1;
			sy = sy || sy === 0 ? sy : sx;
			
			return new $m2x2(
				sx, 0,
				0, sy
			);
		},
		
		/**
		 * Scale on the X-axis
		 * @param Number sx
		 * @return Matrix
		 */
		scaleX: function (sx) {
			return $m.scale(sx, 1);
		},
		
		/**
		 * Scale on the Y-axis
		 * @param Number sy
		 * @return Matrix
		 */
		scaleY: function (sy) {
			return $m.scale(1, sy);
		},
		
		/**
		 * Skews on the X-axis and Y-axis
		 * @param Number degX
		 * @param Number degY
		 * @return Matrix
		 */
		skew: function (degX, degY) {
			degX = degX || 0;
			degY = degY || 0;
			
			//TODO: detect units
			var radX = $.angle.degreeToRadian(degX),
				radY = $.angle.degreeToRadian(degY),
				x = Math.tan(radX),
				y = Math.tan(radY);
			
			return new $m2x2(
				1, x,
				y, 1
			);
		},
		
		/**
		 * Skews on the X-axis
		 * @param Number degX
		 * @return Matrix
		 * @link http://www.w3.org/TR/SVG/coords.html#SkewXDefined
		 */
		skewX: function (degX) {
			return $m.skew(degX);
		},
		
		/**
		 * Skews on the Y-axis
		 * @param Number degY
		 * @return Matrix
		 * @link http://www.w3.org/TR/SVG/coords.html#SkewYDefined
		 */
		skewY: function (degY) {
			return $m.skew(0, degY);
		},
		
		/**
		 * Translate
		 * @param Number tx
		 * @param Number ty
		 * @return Matrix
		 * @link http://www.w3.org/TR/SVG/coords.html#TranslationDefined
		 */
		translate: function (tx, ty) {
			tx = tx || 0;
			ty = ty || 0;
			
			return new $m3x3(
				1, 0, tx,
				0, 1, ty,
				0, 0, 1
			);
		},
		
		/**
		 * Translate on the X-axis
		 * @param Number tx
		 * @return Matrix
		 * @link http://www.w3.org/TR/SVG/coords.html#TranslationDefined
		 */
		translateX: function (tx) {
			return $m.translate(tx);
		},
		
		/**
		 * Translate on the Y-axis
		 * @param Number ty
		 * @return Matrix
		 * @link http://www.w3.org/TR/SVG/coords.html#TranslationDefined
		 */
		translateY: function (ty) {
			return $m.translate(0, ty);
		}
	});
})(jQuery, this, this.document);
/*! Copyright (c) 2010 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.4
 * 
 * Requires: 1.2.2+
 */


(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( event.wheelDelta ) { delta = event.wheelDelta/120; }
    if ( event.detail     ) { delta = -event.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return $.event.handle.apply(this, args);
}

})(jQuery);
// # ZUI53
//
// Copyright (c) 2011 Florian Günther
// 
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

function registerNS(ns)
{
 var nsParts = ns.split(".");
 var root = window;

 for(var i=0; i<nsParts.length; i++)
 {
  if(typeof root[nsParts[i]] == "undefined")
   root[nsParts[i]] = new Object();

  root = root[nsParts[i]];
 }
}

function namespace(name, callback)
{
  registerNS(name);
  callback( eval(name) );
}
;
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  namespace('ZUI53.Tools', function(exports) {
    exports.Base = (function() {
      function Base() {
        this.makeUnexclusive = __bind(this.makeUnexclusive, this);
        this.makeExclusive = __bind(this.makeExclusive, this);
        this.detach = __bind(this.detach, this);
        this.attach = __bind(this.attach, this);        this.set = null;
        this.group = null;
        this.attached = false;
      }
      Base.prototype.attach = function() {
        if (this.group) {
          this.group.attach(this);
        }
        return this.attached = true;
      };
      Base.prototype.detach = function() {
        return this.attached = false;
      };
      Base.prototype.makeExclusive = function() {
        if (this.set) {
          this.set.exclusive(this);
        }
        return this.attach();
      };
      Base.prototype.makeUnexclusive = function() {
        if (this.set) {
          return this.set.unexclusive();
        }
      };
      return Base;
    })();
    exports.SetGroup = (function() {
      function SetGroup() {
        this.requestUnexclusive = __bind(this.requestUnexclusive, this);
        this.requestExclusive = __bind(this.requestExclusive, this);
        this.attach = __bind(this.attach, this);
        this.add = __bind(this.add, this);        this.tools = [];
        this.current = null;
        this.beforeExclusive = null;
      }
      SetGroup.prototype.add = function(tool) {
        tool.group = this;
        this.tools.push(tool);
        if (this.tools.length === 1) {
          return tool.attach();
        }
      };
      SetGroup.prototype.attach = function(tool) {
        var t, _i, _len, _ref, _results;
        this.current = tool;
        _ref = this.tools;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          t = _ref[_i];
          _results.push(t !== tool ? t.detach() : void 0);
        }
        return _results;
      };
      SetGroup.prototype.requestExclusive = function(tool) {
        if (this.current && this.current !== tool) {
          this.current.detach();
        }
        return this.beforeExclusive = this.current;
      };
      SetGroup.prototype.requestUnexclusive = function() {
        this.current = this.beforeExclusive;
        if (this.current) {
          return this.current.attach();
        }
      };
      return SetGroup;
    })();
    return exports.Set = (function() {
      function Set(default_tool) {
        this.default_tool = default_tool;
        this.unexclusive = __bind(this.unexclusive, this);
        this.exclusive = __bind(this.exclusive, this);
        this.add = __bind(this.add, this);
        this.groups = [new exports.SetGroup()];
        this.default_tool.set = this;
        if (this.default_tool) {
          this.default_tool.attach();
        }
      }
      Set.prototype.add = function(tool) {
        this.groups[0].add(tool);
        return tool.set = this;
      };
      Set.prototype.exclusive = function(tool) {
        var g, _i, _len, _ref;
        _ref = this.groups;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          g = _ref[_i];
          g.requestExclusive(tool);
        }
        if (this.default_tool !== tool && this.default_tool) {
          return this.default_tool.detach();
        }
      };
      Set.prototype.unexclusive = function() {
        var g, _i, _len, _ref;
        _ref = this.groups;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          g = _ref[_i];
          g.requestUnexclusive();
        }
        if (this.default_tool) {
          return this.default_tool.attach();
        }
      };
      return Set;
    })();
  });
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  namespace('ZUI53.Tools', function(exports) {
    return exports.Pan = (function() {
      __extends(Pan, exports.Base);
      function Pan(zui) {
        this._start_with = __bind(this._start_with, this);
        this._pan_with = __bind(this._pan_with, this);
        this.touch_stop = __bind(this.touch_stop, this);
        this.touch_move = __bind(this.touch_move, this);
        this.touch_start = __bind(this.touch_start, this);
        this.stop = __bind(this.stop, this);
        this.pan = __bind(this.pan, this);
        this.start = __bind(this.start, this);
        this.detach = __bind(this.detach, this);
        this.attach = __bind(this.attach, this);        this.vp = zui;
        this.eventDispatcher = zui.viewport;
      }
      Pan.prototype.attach = function() {
        $('body').addClass('pan');
        $(this.eventDispatcher).bind('mousedown', this.start);
        return this.eventDispatcher.addEventListener('touchstart', this.touch_start, true);
      };
      Pan.prototype.detach = function() {
        $('body').removeClass('pan');
        this.touch_stop(null);
        $(this.eventDispatcher).unbind('mousedown', this.start);
        return this.eventDispatcher.removeEventListener('touchstart', this.touch_start, true);
      };
      Pan.prototype.start = function(e) {
        $('body').addClass('panning');
        this._start_with(e.screenX, e.screenY);
        window.addEventListener('mousemove', this.pan, true);
        window.addEventListener('mouseup', this.stop, true);
        return e.preventDefault();
      };
      Pan.prototype.pan = function(e) {
        return this._pan_with(e.screenX, e.screenY);
      };
      Pan.prototype.stop = function(e) {
        $('body').removeClass('panning');
        window.removeEventListener('mousemove', this.pan, true);
        window.removeEventListener('mouseup', this.stop, true);
        window.removeEventListener('touchmove', this.pan, true);
        return window.removeEventListener('touchstop', this.stop, true);
      };
      Pan.prototype.touch_start = function(e) {
        this._start_with(e.touches[0].clientX, e.touches[0].clientY);
        this.eventDispatcher.addEventListener('touchmove', this.touch_move, true);
        this.eventDispatcher.addEventListener('touchstop', this.touch_stop, true);
        return e.preventDefault();
      };
      Pan.prototype.touch_move = function(e) {
        return this._pan_with(e.touches[0].clientX, e.touches[0].clientY);
      };
      Pan.prototype.touch_stop = function(e) {
        this.eventDispatcher.removeEventListener('touchmove', this.touch_move, true);
        return this.eventDispatcher.removeEventListener('touchstop', this.touch_stop, true);
      };
      Pan.prototype._pan_with = function(x, y) {
        var dX, dY;
        dX = x - this.startX;
        dY = y - this.startY;
        this.startX = x;
        this.startY = y;
        return this.vp.panBy(dX, dY);
      };
      Pan.prototype._start_with = function(x, y) {
        this.startX = x;
        return this.startY = y;
      };
      return Pan;
    })();
  });
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  namespace('ZUI53.Tools', function(exports) {
    return exports.Zoom = (function() {
      __extends(Zoom, exports.Base);
      function Zoom(zui) {
        this.find_distance = __bind(this.find_distance, this);
        this.find_midpoint = __bind(this.find_midpoint, this);
        this.touch_move = __bind(this.touch_move, this);
        this._internal_gesture_end = __bind(this._internal_gesture_end, this);
        this._internal_gesture_start = __bind(this._internal_gesture_start, this);
        this.gesture_end = __bind(this.gesture_end, this);
        this.gesture_move = __bind(this.gesture_move, this);
        this.gesture_start = __bind(this.gesture_start, this);
        this.zoom = __bind(this.zoom, this);
        this.moz_touch_up = __bind(this.moz_touch_up, this);
        this.moz_touch_move = __bind(this.moz_touch_move, this);
        this.moz_touch_down = __bind(this.moz_touch_down, this);
        this.create_touch_index = __bind(this.create_touch_index, this);
        this.update_moz_touch = __bind(this.update_moz_touch, this);
        this.fetch_touch = __bind(this.fetch_touch, this);
        this.detach = __bind(this.detach, this);
        this.attach = __bind(this.attach, this);        this.vp = zui;
        this.eventDispatcher = zui.viewport;
        this.use_capture = true;
        this.t1 = null;
        this.t2 = null;
        this.touch = {
          touches: [],
          touch_ids: []
        };
      }
      Zoom.prototype.attach = function() {
        $(this.eventDispatcher).mousewheel(this.zoom);
        this.eventDispatcher.addEventListener('gesturestart', this.gesture_start, this.use_capture);
        this.eventDispatcher.addEventListener('MozTouchDown', this.moz_touch_down, this.use_capture);
        return this.eventDispatcher.addEventListener('MozTouchUp', this.moz_touch_up, this.use_capture);
      };
      Zoom.prototype.detach = function() {
        $(this.eventDispatcher).unmousewheel(this.zoom);
        this.eventDispatcher.removeEventListener('gesturestart', this.gesture_start, this.use_capture);
        this.eventDispatcher.removeEventListener('MozTouchDown', this.moz_touch_down, this.use_capture);
        return this.eventDispatcher.removeEventListener('MozTouchUp', this.moz_touch_up, this.use_capture);
      };
      Zoom.prototype.fetch_touch = function(e, value) {
        if (this.t1 && this.t1.streamId === e.streamId) {
          this.t1 = value || e;
        } else {
          this.t2 = value || e;
        }
        return this.update_moz_touch();
      };
      Zoom.prototype.update_moz_touch = function() {
        var mp;
        if (this.t1 && this.t2) {
          try {
            return mp = this.find_midpoint({
              touches: [this.t1, this.t2]
            });
          } catch (e) {
            return console.log(e);
          }
        } else if (this.t1 || this.t2) {
          return console.log('only one');
        }
      };
      Zoom.prototype.create_touch_index = function(streamId) {
        var i;
        i = this.touch.touch_ids.indexOf(streamId);
        if (i < 0) {
          i = this.touch.touch_ids.length;
          this.touch.touch_ids[i] = streamId;
        }
        return i;
      };
      Zoom.prototype.moz_touch_down = function(e) {
        var i;
        this.touch_df = null;
        try {
          i = this.create_touch_index(e.streamId);
          this.touch.touches[i] = e;
          if (this.touch.touches.length === 2) {
            this._internal_gesture_start();
            return this.eventDispatcher.addEventListener('MozTouchMove', this.moz_touch_move, this.use_capture);
          }
        } catch (e) {
          return console.log(e);
        }
      };
      Zoom.prototype.moz_touch_move = function(e) {
        var d, i, s;
        i = this.create_touch_index(e.streamId);
        this.touch.touches[i] = e;
        this.touch_move(this.touch);
        d = this.find_distance(this.touch);
        if (this.touch_df) {
          s = this.touch_df * d;
          return this.gesture_move({
            scale: s
          });
        } else {
          return this.touch_df = 1 / d;
        }
      };
      Zoom.prototype.moz_touch_up = function(e) {
        var i;
        i = this.touch.touch_ids.indexOf(e.streamId);
        if (i > 0) {
          console.log("Removed: " + i);
          if (this.touch.touches.length === 2) {
            this._internal_gesture_end();
            this.eventDispatcher.removeEventListener('MozTouchMove', this.moz_touch_move, this.use_capture);
          }
          this.touch.touches.splice(i, 1);
          return this.touch.touch_ids.splice(i, 1);
        }
      };
      Zoom.prototype.zoom = function(e) {
        var delta, f;
        delta = e.wheelDelta || (e.detail * -1);
        f = 0.05;
        if (delta < 0) {
          f *= -1;
        }
        this.vp.zoomBy(f, e.clientX, e.clientY);
        e.stopImmediatePropagation();
        return e.preventDefault();
      };
      Zoom.prototype.gesture_start = function(e) {
        this._internal_gesture_start();
        this.eventDispatcher.addEventListener('gesturechange', this.gesture_move, this.use_capture);
        this.eventDispatcher.addEventListener('gestureend', this.gesture_end, this.use_capture);
        this.eventDispatcher.addEventListener('touchmove', this.touch_move, this.use_capture);
        return e.preventDefault();
      };
      Zoom.prototype.gesture_move = function(e) {
        if (this.last_touch_p) {
          return this.vp.zoomSet(this.start_scale * e.scale, this.last_touch_p.e(1), this.last_touch_p.e(2));
        }
      };
      Zoom.prototype.gesture_end = function(e) {
        this.eventDispatcher.removeEventListener('touchmove', this.touch_move, this.use_capture);
        this.eventDispatcher.removeEventListener('gesturechange', this.gesture_move, this.use_capture);
        this.eventDispatcher.removeEventListener('gestureend', this.gesture_end, this.use_capture);
        return this._internal_gesture_end();
      };
      Zoom.prototype._internal_gesture_start = function() {
        this.makeExclusive();
        this.last_touch_p = null;
        return this.start_scale = this.vp.scale;
      };
      Zoom.prototype._internal_gesture_end = function() {
        return this.makeUnexclusive();
      };
      Zoom.prototype.touch_move = function(e) {
        var d, new_touch_p;
        if (this.last_touch_p) {
          new_touch_p = this.find_midpoint(e);
          d = new_touch_p.subtract(this.last_touch_p);
          this.last_touch_p = new_touch_p;
          return this.vp.panBy(d.e(1), d.e(2));
        } else {
          return this.last_touch_p = this.find_midpoint(e);
        }
      };
      Zoom.prototype.find_midpoint = function(e) {
        var d, p, p1, p2, t1, t2;
        t1 = e.touches[0];
        t2 = e.touches[1];
        p1 = $V([t1.clientX, t1.clientY, 1]);
        p2 = $V([t2.clientX, t2.clientY, 1]);
        d = p2.subtract(p1).multiply(0.5);
        return p = p1.add(d);
      };
      Zoom.prototype.find_distance = function(e) {
        var p1, p2, t1, t2;
        t1 = e.touches[0];
        t2 = e.touches[1];
        p1 = $V([t1.clientX, t1.clientY, 1]);
        p2 = $V([t2.clientX, t2.clientY, 1]);
        return p2.distanceFrom(p1);
      };
      return Zoom;
    })();
  });
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  namespace('ZUI53.Surfaces', function(exports) {
    return exports.SVG = (function() {
      function SVG(node) {
        this.node = node;
        this.apply = __bind(this.apply, this);
      }
      SVG.prototype.limits = function() {
        return [0.0001, 20000];
      };
      SVG.prototype.apply = function(panX, panY, scale) {
        var singleSVG;
        singleSVG = "translate(" + panX + ", " + panY + ") scale(" + scale + ", " + scale + ")";
        return $(this.node).attr("transform", singleSVG);
      };
      return SVG;
    })();
  });
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  namespace('ZUI53.Surfaces', function(exports) {
    return exports.CSS = (function() {
      function CSS(node) {
        this.node = node;
        this.apply = __bind(this.apply, this);
        $(this.node).transform({
          origin: ['0', '0']
        });
        $(this.node).css({
          'position': 'absolute'
        });
      }
      CSS.prototype.limits = function() {
        return null;
      };
      CSS.prototype.apply = function(panX, panY, scale) {
        return $(this.node).transform({
          matrix: [scale, 0.0, 0.0, scale, panX, panY]
        });
      };
      return CSS;
    })();
  });
}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  namespace('ZUI53', function(exports) {
    return exports.Viewport = (function() {
      function Viewport(vp) {
        this.setTransformString = __bind(this.setTransformString, this);
        this.getTransformString = __bind(this.getTransformString, this);
        this.setPanAndScale = __bind(this.setPanAndScale, this);
        this.getPanAndScale = __bind(this.getPanAndScale, this);
        this.showBounds = __bind(this.showBounds, this);
        this.avp = __bind(this.avp, this);
        this.translateSurface = __bind(this.translateSurface, this);
        this.fitToLimits = __bind(this.fitToLimits, this);
        this.zoomSet = __bind(this.zoomSet, this);
        this.zoomBy = __bind(this.zoomBy, this);
        this.panBy = __bind(this.panBy, this);
        this.updateSurface = __bind(this.updateSurface, this);
        this.surfaceToClient = __bind(this.surfaceToClient, this);
        this.layerToSurface = __bind(this.layerToSurface, this);
        this.clientToSurface = __bind(this.clientToSurface, this);
        this.addLimits = __bind(this.addLimits, this);
        this.addSurface = __bind(this.addSurface, this);
        this.reset = __bind(this.reset, this);        this.min_scale = null;
        this.max_scale = null;
        this.viewport = this.styleViewport(vp);
        this.surfaces = [];
        this.vpOffset = $(vp).offset();
        this.vpOffM = $M([[1, 0, this.vpOffset.left], [0, 1, this.vpOffset.top], [0, 0, 1]]);
        this.reset();
        $(vp).scroll(__bind(function(e) {
          var jVP;
          jVP = $(this.viewport);
          this.panBy(-jVP.scrollLeft(), -jVP.scrollTop());
          return jVP.scrollTop(0).scrollLeft(0);
        }, this));
        this.toolset = new ZUI53.Tools.Set(new ZUI53.Tools.Zoom(this));
      }
      Viewport.prototype.styleViewport = function(vp) {
        $(vp).css({
          'position': 'relative',
          'overflow': 'hidden',
          'width': '100%',
          'height': '100%'
        });
        return vp;
      };
      Viewport.prototype.reset = function() {
        this.zoomPos = 0;
        this.scale = 1.0;
        this.surfaceM = $M([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
        return this.updateSurface();
      };
      Viewport.prototype.addSurface = function(surface) {
        this.surfaces.push(surface);
        return this.addLimits(surface.limits());
      };
      Viewport.prototype.addLimits = function(limits) {
        if (!limits) {
          return;
        }
        if (this.min_scale || this.max_scale) {
          if (limits[0]) {
            this.min_scale = Math.max(limits[0], this.min_scale);
          }
          if (limits[1]) {
            return this.max_scale = Math.min(limits[1], this.max_scale);
          }
        } else {
          this.min_scale = limits[0];
          return this.max_scale = limits[1];
        }
      };
      Viewport.prototype.clientToSurface = function(x, y) {
        var sV, v;
        v = $V([x, y, 1]);
        return sV = this.surfaceM.inverse().multiply(this.vpOffM.inverse().multiply(v));
      };
      Viewport.prototype.layerToSurface = function(x, y) {
        var sV, v;
        v = $V([x, y, 1]);
        return sV = this.surfaceM.inverse().multiply(v);
      };
      Viewport.prototype.surfaceToClient = function(v) {
        return this.vpOffM.multiply(this.surfaceM.multiply(v));
      };
      Viewport.prototype.updateSurface = function() {
        var node, v, _i, _len, _ref;
        v = this.getPanAndScale();
        _ref = this.surfaces;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          node.apply(v[0], v[1], v[2]);
        }
        return true;
      };
      Viewport.prototype.panBy = function(x, y) {
        this.translateSurface(x, y);
        return this.updateSurface();
      };
      Viewport.prototype.zoomBy = function(byF, clientX, clientY) {
        var newScale;
        newScale = this._pos_to_scale(this.zoomPos + byF);
        return this.zoomSet(newScale, clientX, clientY);
      };
      Viewport.prototype.zoomSet = function(newScale, clientX, clientY) {
        var c, dX, dY, scaleBy, sf;
        newScale = this.fitToLimits(newScale);
        this.zoomPos = this._scale_to_pos(newScale);
        if (newScale !== this.scale) {
          sf = this.clientToSurface(clientX, clientY);
          scaleBy = newScale / this.scale;
          this.surfaceM = this._scaleMatrix(this.surfaceM, scaleBy);
          this.scale = newScale;
          c = this.surfaceToClient(sf);
          dX = clientX - c.e(1);
          dY = clientY - c.e(2);
          this.translateSurface(dX, dY);
        }
        return this.updateSurface();
      };
      Viewport.prototype.fitToLimits = function(s) {
        if (this.min_scale && s < this.min_scale) {
          s = this.min_scale;
        } else if (this.max_scale && s > this.max_scale) {
          s = this.max_scale;
        }
        return s;
      };
      Viewport.prototype.translateSurface = function(x, y) {
        return this.surfaceM = this._translateMatrix(this.surfaceM, x, y);
      };
      Viewport.prototype._translateMatrix = function(m, x, y) {
        return m.add($M([[0, 0, x], [0, 0, y], [0, 0, 0]]));
      };
      Viewport.prototype._scaleMatrix = function(m, s) {
        return m.multiply($M([[s, 0, 0], [0, s, 0], [0, 0, 1]]));
      };
      Viewport.prototype._pos_to_scale = function(pos) {
        return Math.exp(pos);
      };
      Viewport.prototype._scale_to_pos = function(s) {
        return Math.log(s);
      };
      Viewport.prototype.avp = function() {
        var del, max, min;
        min = this.clientToSurface(this.vpOffset.left, this.vpOffset.top);
        max = this.clientToSurface(this.vpOffset.left + $(this.viewport).width(), this.vpOffset.top + $(this.viewport).height());
        del = max.subtract(min);
        return {
          x: min.e(1),
          y: min.e(2),
          width: del.e(1),
          height: del.e(2)
        };
      };
      Viewport.prototype._boundsCenter = function(b) {
        return {
          x: b.x + b.width / 2,
          y: b.y + b.height / 2
        };
      };
      Viewport.prototype.showBounds = function(evp) {
        var aC, avp, eC, exp, s;
        if (evp.width === 0 || evp.height === 0) {
          return;
        }
        avp = this.avp();
        s = Math.min(avp.width / evp.width, avp.height / evp.height);
        exp = 50 / s;
        evp.x -= exp;
        evp.y -= exp;
        evp.width += 2 * exp;
        evp.height += 2 * exp;
        s = Math.min(avp.width / evp.width, avp.height / evp.height);
        s = this.fitToLimits(s);
        eC = this._boundsCenter(evp);
        aC = this._boundsCenter(avp);
        this.setPanAndScale(-eC.x * s, -eC.y * s, s);
        this.translateSurface($(this.viewport).width() / 2, $(this.viewport).height() / 2);
        return this.updateSurface();
      };
      Viewport.prototype.getPanAndScale = function() {
        return [this.surfaceM.e(1, 3), this.surfaceM.e(2, 3), this.surfaceM.e(1, 1)];
      };
      Viewport.prototype.setPanAndScale = function(panX, panY, scale) {
        this.surfaceM = $M([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
        this.translateSurface(panX, panY);
        this.surfaceM = this._scaleMatrix(this.surfaceM, scale);
        this.scale = scale;
        return this.zoomPos = this._scale_to_pos(scale);
      };
      Viewport.prototype.getTransformString = function() {
        return this.getPanAndScale().join(',');
      };
      Viewport.prototype.setTransformString = function(str) {
        var panX, panY, scale, v;
        if (!str) {
          return;
        }
        v = str.split(',');
        console.log(v.length);
        panX = Number(v[0]);
        panY = Number(v[1]);
        scale = Number(v[2]);
        this.setPanAndScale(panX, panY, scale);
        return this.updateSurface();
      };
      return Viewport;
    })();
  });
}).call(this);
