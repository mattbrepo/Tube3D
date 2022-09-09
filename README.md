# Tube3D
Drawing 3D tubes with [Babylon.js](https://www.babylonjs.com/) using the LRA system and a bit of linear algebra.

**Language: Javascript**

**Start: 2022**

## Why
I wanted to try the [Babylon.js](https://www.babylonjs.com/) 3D library. I chose to create a simple tube 3D drawing tool with it. Tubes in the field of [tube bending machines](https://en.wikipedia.org/wiki/Tube_bending) are often represented with the LRA system. This system allows to easily describe a bent tube by dividing it in sequences of:

- a straight part of a given length (**L**)
- a rotation between the straight part and the bend (**R**)
- a bend of a given angle (**A**) and radius

LRA stands for Length, Rotation and Angle. 

## Example

LRA:

  L  |  R  |  A  | Radius
-----|-----|-----|--------
 100 |  0  |  90 |  30
 50  | 90  | 180 |  50
 150 |     |     |

Javascript code:

```javascript
let LRA = '';

//        L          R          A         Radius
LRA += ' 100         0          90          30    ' + "\n";
LRA += '  50         90        180          50    ' + "\n";
LRA += ' 150         0          0           0     ';
```

The final 3D tube:

![Example](/images/example.jpg)

## Linear Algebra

A few linear algebra concepts that I needed in this project:

- given two points _A_ and _B_, the vector going from _A_ to _B_ can be expressed as: _B_ - _A_
- the vector orthogonal to two vectors can be found by applying the cross product
- the points of a circle with center _C_ and radius _r_ lying on a 3D plane defined by two orthogonal unit vectors (_V_ and _W_) can be expressed by the following expressions:

$$ P_x = C_x + r \cdot cos(\alpha) \cdot V_x + r \cdot cos(\alpha) \cdot W_x $$

$$ P_y = C_y + r \cdot cos(\alpha) \cdot V_y + r \cdot cos(\alpha) \cdot W_y $$

$$ P_x = C_z + r \cdot cos(\alpha) \cdot V_z + r \cdot cos(\alpha) \cdot W_z $$

