export type MtlPath = string;
export type ObjPath = string;
export type MtlAndObjFiles = [MtlPath, ObjPath];

export type GlbPath = string;

export type Size = number;
export type Position = [number, number, number];
export type Rotation = [number, number, number];

export type GLTFFile = [GlbPath, Size, Position, Rotation];

export type SunParameters = {
    inclination: number;
    azimuth: number;
};
