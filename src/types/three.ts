export type MtlPath = string;
export type ObjPath = string;
export type MtlAndObjFiles = [MtlPath, ObjPath];

export type GlbPath = string;

export type Size = number;
export type X = number;
export type Y = number;
export type Z = number;

export type GLTFFile = [GlbPath, Size, X, Y, Z];

export type SunParameters = {
    inclination: number;
    azimuth: number;
};
