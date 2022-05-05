declare module "ffmpeg-extract-frames" {
    function extractFrames(opt: { input: string; output: string; offsets: number[] }): any
    export = extractFrames
}
