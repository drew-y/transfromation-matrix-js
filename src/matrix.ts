import { EulerOrder } from "./definitions";
import { clamp, degrees, radians, round } from "./math";

/**
 * Transformation Matrix helper class.
 *
 * Adapted from mrdoob/three.js at
 * https://github.com/mrdoob/three.js/blob/d4aa9e00ea29808534a3e082f602c544e5f2419c/src/math/Matrix3.js
 * */
export class Matrix {
    // Column-major ordered
    private elements = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    getElements(): number[] {
        return [...this.elements];
    }

    /** Set from a flat 4x4 column major transformation matrix */
    setFromMatrixArray(matrix: number[]): this {
        this.elements = matrix;
        return this;
    }

    setPosition(x: number, y: number, z: number): this {
        this.elements[12] = x;
        this.elements[13] = y;
        this.elements[14] = z;
        return this;
    }

    /** Set from euler angles in degrees. */
    setRotation(x: number, y: number, z: number, order: EulerOrder = "XYZ"): this {
        x = radians(x), y = radians(y), z = radians(z);
        const cx = Math.cos(x), sx = Math.sin(x);
        const cy = Math.cos(y), sy = Math.sin(y);
        const cz = Math.cos(z), sz = Math.sin(z);

        if (order === "XYZ") {
            const ae = cx * cz, af = cx * sz, be = sx * cz, bf = sx * sz;

            this.elements[0] = cy * cz;
            this.elements[4] = - cy * sz;
            this.elements[8] = sy;

            this.elements[1] = af + be * sy;
            this.elements[5] = ae - bf * sy;
            this.elements[9] = - sx * cy;

            this.elements[2] = bf - ae * sy;
            this.elements[6] = be + af * sy;
            this.elements[10] = cx * cy;
            return this;
        }

        if (order === "YXZ") {
            const ce = cy * cz, cf = cy * sz, de = sy * cz, df = sy * sz;

            this.elements[0] = ce + df * sx;
            this.elements[4] = de * sx - cf;
            this.elements[8] = cx * sy;

            this.elements[1] = cx * sz;
            this.elements[5] = cx * cz;
            this.elements[9] = - sx;

            this.elements[2] = cf * sx - de;
            this.elements[6] = df + ce * sx;
            this.elements[10] = cx * cy;

            return this;
        }

        if (order === "ZXY") {
            const ce = cy * cz, cf = cy * sz, de = sy * cz, df = sy * sz;

            this.elements[0] = ce - df * sx;
            this.elements[4] = - cx * sz;
            this.elements[8] = de + cf * sx;

            this.elements[1] = cf + de * sx;
            this.elements[5] = cx * cz;
            this.elements[9] = df - ce * sx;

            this.elements[2] = - cx * sy;
            this.elements[6] = sx;
            this.elements[10] = cx * cy;

            return this;
        }

        if (order === "ZYX") {
            const ae = cx * cz, af = cx * sz, be = sx * cz, bf = sx * sz;

            this.elements[0] = cy * cz;
            this.elements[4] = be * sy - af;
            this.elements[8] = ae * sy + bf;

            this.elements[1] = cy * sz;
            this.elements[5] = bf * sy + ae;
            this.elements[9] = af * sy - be;

            this.elements[2] = - sy;
            this.elements[6] = sx * cy;
            this.elements[10] = cx * cy;

            return this;
        }

        if (order === "YZX") {
            const ac = cx * cy, ad = cx * sy, bc = sx * cy, bd = sx * sy;

            this.elements[0] = cy * cz;
            this.elements[4] = bd - ac * sz;
            this.elements[8] = bc * sz + ad;

            this.elements[1] = sz;
            this.elements[5] = cx * cz;
            this.elements[9] = - sx * cz;

            this.elements[2] = - sy * cz;
            this.elements[6] = ad * sz + bc;
            this.elements[10] = ac - bd * sz;

            return this;
        }

        if (order === "ZYZ") {
            if (sy === 0) {
                this.elements[0] = cx * cz - sx * sz;
                this.elements[4] = -cz * sx - cx * sz;

                this.elements[1] = cz * sx + cx * sz;
                this.elements[5] = cx * cz - sx * sz;

                return this;
            }

            if (round(sy, 4) === 3.1416) {
                this.elements[0] = -cx * cz - sx * sz;
                this.elements[4] = -cz * sx + cx * sz;

                this.elements[1] = -cz * sx + cx * sz;
                this.elements[5] = cx * cz + sx * sz;

                return this;
            }

            this.elements[0] = cx * cy * cz - sx * sz;
            this.elements[4] = -cz * sx - cy * cx * sz;
            this.elements[8] = cx * sy;

            this.elements[1] = sx * cy * cz + cx * sz;
            this.elements[5] = cx * cz - cy * sx * sz;
            this.elements[9] = sx * sy;

            this.elements[2] = -sy * cz;
            this.elements[6] = sy * sz;
            this.elements[10] = cy;

            return this;
        }

        if (order === "XZY") {
            const ac = cx * cy, ad = cx * sy, bc = sx * cy, bd = sx * sy;

            this.elements[0] = cy * cz;
            this.elements[4] = bd - ac * sz;
            this.elements[8] = bc * sz + ad;

            this.elements[1] = sz;
            this.elements[5] = cx * cz;
            this.elements[9] = - sx * cz;

            this.elements[2] = - sy * cz;
            this.elements[6] = ad * sz + bc;
            this.elements[10] = ac - bd * sz;

            return this;
        }

        throw new Error(`Unrecognized order ${order}`);
    }

    setRotationFromQuaternion(x: number, y: number, z: number, w: number): this {
        const x2 = x + x, y2 = y + y, z2 = z + z;
        const xx = x * x2, xy = x * y2, xz = x * z2;
        const yy = y * y2, yz = y * z2, zz = z * z2;
        const wx = w * x2, wy = w * y2, wz = w * z2;

        this.elements[0] = (1 - (yy + zz));
        this.elements[1] = (xy + wz);
        this.elements[2] = (xz - wy);

        this.elements[4] = (xy - wz);
        this.elements[5] = (1 - (xx + zz));
        this.elements[6] = (yz + wx);

        this.elements[8] = (xz + wy);
        this.elements[9] = (yz - wx);
        this.elements[10] = (1 - (xx + yy));

        return this;
    }

    /** Creates a new Matrix that is the product of this matrix and the passed one. */
    multiplied(m: Matrix): Matrix {
        const ae = this.elements;
        const be = m.toArray();
        const te: number[] = [];

        const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
        const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
        const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
        const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
        const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return new Matrix().setFromMatrixArray(te);
    }

    /** Multiply this matrix by the passed one */
    multiply(matrix: Matrix) {
        this.setFromMatrixArray(this.multiplied(matrix).getElements());
    }

    /** Alias for multiply */
    transform(matrix: Matrix) {
        this.multiply(matrix);
    }

    /** Rotates this matrix by the supplied quaternion */
    applyQuaternion(x: number, y: number, z: number, w: number) {
        const a = this.toQuaternion();

        const qax = a[0], qay = a[1], qaz = a[2], qaw = a[3];
        const qbx = x, qby = y, qbz = z, qbw = w;

        const nx = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
        const ny = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
        const nz = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
        const nw = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

        return new Matrix().setRotationFromQuaternion(nx, ny, nz, nw);
    }

    /** Create a new matrix that represents this one rotated by the passed angles */
    rotated(x: number, y: number, z: number, order: EulerOrder = "XYZ"): Matrix {
        const [qx, qy, qz, qw] = new Matrix().setRotation(x, y, z, order).toQuaternion();
        return this.clone().applyQuaternion(qx, qy, qz, qw);
    }


    /** Rotate this matrix by the passed angles */
    rotate(x: number, y: number, z: number, order?: EulerOrder): this {
        const [qx, qy, qz, qw] = new Matrix().setRotation(x, y, z, order).toQuaternion();
        this.applyQuaternion(qx, qy, qz, qw);
        return this;
    }

    /** Returns a three length array representing angles in degrees */
    toEuler(order: EulerOrder = "XYZ"): number[] {
        const te = this.elements;
        const m11 = te[0], m12 = te[4], m13 = te[8];
        const m21 = te[1], m22 = te[5], m23 = te[9];
        const m31 = te[2], m32 = te[6], m33 = te[10];

        let x, y, z: number;
        if (order === "XYZ") {
            y = Math.asin(clamp(m13, - 1, 1));

            if (Math.abs(m13) < 0.9999999) {
                x = Math.atan2(- m23, m33);
                z = Math.atan2(- m12, m11);
            } else {
                x = Math.atan2(m32, m22);
                z = 0;
            }
        } else if (order === "YXZ") {
            x = Math.asin(- clamp(m23, - 1, 1));

            if (Math.abs(m23) < 0.9999999) {
                y = Math.atan2(m13, m33);
                z = Math.atan2(m21, m22);
            } else {
                y = Math.atan2(- m31, m11);
                z = 0;
            }
        } else if (order === "ZXY") {
            x = Math.asin(clamp(m32, - 1, 1));

            if (Math.abs(m32) < 0.9999999) {
                y = Math.atan2(- m31, m33);
                z = Math.atan2(- m12, m22);
            } else {
                y = 0;
                z = Math.atan2(m21, m11);
            }
        } else if (order === "ZYX") {
            y = Math.asin(- clamp(m31, - 1, 1));

            if (Math.abs(m31) < 0.9999999) {
                x = Math.atan2(m32, m33);
                z = Math.atan2(m21, m11);
            } else {
                x = 0;
                z = Math.atan2(- m12, m22);
            }
        } else if (order === "YZX") {
            z = Math.asin(clamp(m21, - 1, 1));

            if (Math.abs(m21) < 0.9999999) {
                x = Math.atan2(- m23, m22);
                y = Math.atan2(- m31, m11);
            } else {
                x = 0;
                y = Math.atan2(m13, m33);
            }
        } else if (order === "XZY") {
            z = Math.asin(- clamp(m12, - 1, 1));

            if (Math.abs(m12) < 0.9999999) {
                x = Math.atan2(m32, m22);
                y = Math.atan2(m13, m11);
            } else {
                x = Math.atan2(- m23, m33);
                y = 0;
            }
        } else if (order === "ZYZ") {
            if (m33 < 1) {
                if (m33 > -1) {
                    x = Math.atan2(m23, m13);
                    z = Math.atan2(m32, -m31);
                    y = Math.acos(m33);
                    // y = Math.atan2(m13 * Math.cos(x) + m23 * Math.sin(x), m33);
                } else {
                    y = Math.PI;
                    x = -Math.atan2(m21, m22);
                    z = 0;
                }
            } else {
                y = 0;
                x = Math.atan2(m21, m22);
                z = 0;
            }
        } else {
            throw new Error("Invalid euler order.");
        }

        return [x, y, z].map(degrees) as [number, number, number];
    }

    /** Returns a quaternion representing this rotation as XYZW */
    toQuaternion(): [number, number, number, number] {
        const te = this.elements;

        const m11 = te[0], m12 = te[4], m13 = te[8];
        const m21 = te[1], m22 = te[5], m23 = te[9];
        const m31 = te[2], m32 = te[6], m33 = te[10];

        const trace = m11 + m22 + m33;

        let w, x, y, z: number;
        if (trace > 0) {
            const s = 0.5 / Math.sqrt(trace + 1.0);

            w = 0.25 / s;
            x = (m32 - m23) * s;
            y = (m13 - m31) * s;
            z = (m21 - m12) * s;
        } else if (m11 > m22 && m11 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

            w = (m32 - m23) / s;
            x = 0.25 * s;
            y = (m12 + m21) / s;
            z = (m13 + m31) / s;
        } else if (m22 > m33) {
            const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

            w = (m13 - m31) / s;
            x = (m12 + m21) / s;
            y = 0.25 * s;
            z = (m23 + m32) / s;
        } else {
            const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

            w = (m21 - m12) / s;
            x = (m13 + m31) / s;
            y = (m23 + m32) / s;
            z = 0.25 * s;
        }

        return [x, y, z, w];
    }

    toArray(): number[] {
        return [...this.elements];
    }

    clone(): Matrix {
        return new Matrix().setFromMatrixArray(this.toArray());
    }

    toMatrix3(): number[] {
        const m = this.elements;

        return [
            m[0], m[1], m[2],
            m[4], m[5], m[6],
            m[2], m[6], m[10]
        ]
    }
}
