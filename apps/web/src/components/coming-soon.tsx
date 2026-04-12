import { Inconsolata } from "next/font/google"
import Image from "next/image"

const inconsolata = Inconsolata({
    weight: "700",
})

export function ComingSoon() {
    return (
        <div className="w-full min-h-dvh flex flex-col justify-center items-center overflow-hidden relative">
            <div className="fixed inset-0 w-full h-full bg-[url('/water-glimmer.webp')] bg-cover bg-center bg-no-repeat -z-10" />
            <div className="flex flex-col md:flex-row gap-y-2 md:gap-x-4 justify-center items-center text-center px-4 w-full">
                <div className="flex flex-row items-end z-10 justify-center gap-x-2">
                    <img src={"/text-cpe.webp"} alt="CPE" className="h-20 sm:h-24 md:h-24 lg:h-36 xl:h-44 object-contain" />
                    <div className="relative md:hidden -top-10 sm:-top-14">
                        <img src={"/2026.webp"} className="h-16 sm:h-20 object-contain z-10" alt="2026" />
                        <img src={"/star-1.webp"} className="absolute -top-4 -right-2 rotate-45 h-10 object-contain z-50 drop-shadow-md" alt="Star" />
                    </div>
                </div>
                <img src={"/text-family.webp"} className="h-20 sm:h-24 md:h-32 lg:h-48 xl:h-60 object-contain z-0 mt-[-10px] md:mt-0" alt="Family" />
                <img src={"/2026.webp"} className="hidden md:block md:h-20 lg:h-36 relative md:-top-10 lg:top-[-75px] lg:-ml-6 object-contain z-10" alt="2026" />
            </div>
            <div className="flex gap-x-2 sm:gap-x-4 justify-center items-center text-center mt-2 sm:mt-4 z-10">
                <div className={`${inconsolata.className} text-4xl sm:text-5xl md:text-6xl lg:text-8xl text-[#423d39] text-stroke-1 lg:text-stroke-2 text-stroke-white`}>coming soon</div>
                <img src={"/excl.webp"} className="h-10 sm:h-12 md:h-16 lg:h-[80px] object-contain" alt="Exclaimation Mark" />
            </div>
            <img src={"/rainb.webp"} alt="Rainbow" className="absolute z-0 top-[-5%] left-[-5%] lg:-top-2.5 lg:left-[-10px] scale-x-[-1] w-24 sm:w-32 md:w-48 lg:w-auto h-auto object-contain" />
            <img src={"/rainb.webp"} alt="Rainbow" className="absolute z-0 top-[-5%] right-[-5%] lg:-top-2.5 lg:right-[-10px] w-24 sm:w-32 md:w-48 lg:w-auto h-auto object-contain" />
            <img src={"/star-1.webp"} className="absolute top-0 left-4 rotate-16 h-32 object-contain z-50 drop-shadow-md hidden lg:block" alt="Star" />
            <img src={"/star-1.webp"} className="absolute top-32 left-24 -rotate-84 h-32 object-contain z-50 drop-shadow-md hidden lg:block" alt="Star" />
            <img src={"/star-1.webp"} className="absolute top-32 right-24 -rotate-46 h-32 object-contain z-50 drop-shadow-md hidden lg:block" alt="Star" />
            <img src={"/star-1.webp"} className="absolute bottom-26 right-68 -rotate-16 h-32 object-contain z-50 drop-shadow-md" alt="Star" />
            <img src={"/cpefam-mc-cropped.webp"} alt="CPE Family MC" className="absolute -bottom-10 left-0 hidden lg:block h-[358px]" />
            <img src={"/cpefam-mc-cropped.webp"} alt="CPE Family MC" className="absolute -bottom-10 -right-8 lg:hidden h-64" />
            <div className="absolute bottom-10 left-4 lg:left-auto lg:right-16 z-20">
                <img src={"/plane.webp"} alt="Plane" className="absolute bottom-6 lg:bottom-10 left-0 lg:left-auto lg:right-0 h-16 lg:h-24 max-w-none -z-10" />
                <img src={"/barcode.webp"} alt="CPE Family Barcode" className="h-10 lg:h-14 relative z-10" />
            </div>
        </div>
    )
}