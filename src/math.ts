
export const degrees = (radians: number) => radians * (180 / Math.PI);
export const radians = (degrees: number) => degrees * (Math.PI / 180);
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const round = (num: number, scale = 5) => {
    if (!(`${num}`).includes("e")) {
        return +(`${Math.round(Number(`${num}e+${scale}`))}e-${scale}`);
    }

    const arr = (`${num}`).split("e");
    const sig = +arr[1] + scale > 0 ? "+" : "";
    return +(`${Math.round(Number(`${+arr[0]}e${sig}${+arr[1] + scale}`))}e-${scale}`);
};
