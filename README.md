# Tube3D
Tube 3D drawing with [Babylon.js](https://www.babylonjs.com/) (LRA)

**Language: Javascript**

**Start: 2022**

## Why
I used the [Babylon.js](https://www.babylonjs.com/) library to create a simple tube 3D drawing tool. Tubes in the field of [tube bending machines](https://en.wikipedia.org/wiki/Tube_bending) are often represented with the LRA system. This system allows to easily describe a bent tube by dividing it in sequences of:

- a straight part of a given length (**L**)
- a rotation between the straight part and the bend (**R**)
- a bend of a given angle (**A**) and radius

LRA stands for Length, Rotation and Angle. 

## Example

```javascript
let LRA = '';

//        L          R          A         Radius
LRA += ' 100         0          90          30    ' + "\n";
LRA += '  50         90        180          50    ' + "\n";
LRA += ' 150         0          0           0     ';
```

  L  |  R  |  A  | Radius
-----|-----|-----|--------
 100 |  0  |  90 |  30
 50  | 90  | 180 |  50
 150 |     |     |


![Example](/images/example.jpg)
