

import image1 from './images/image1.png';

export default function Dashboard() {
    return (
        <div>
            <Body></Body>
            <Info></Info>
        </div>
    )
}

function Body() {
    return (
        <div className="bg-gradient-to-br from-[#f9efd5] to-white ">

            <div className="flex items-center justify-center pt-6">
                <span className="flex items-center justify-center border border-[#eed48d] rounded-full px-4 py-2 gap-2 font-medium text-[#0a5614]" >
                    {/* <img src="src/components/images/logo.png" alt="" className="h-4"/> */}
                    Bridging Ancient Wisdom with Modern Medicine
                </span>
            </div>

            <div>

                <div className="mt-12 text-center">
                    <p className="text-7xl font-bold text-[#0a5614]">Unified Medical Coding</p>
                    <p className="text-7xl font-bold text-[#017be8]">for the Future</p>
                    <p className=" mt-10 text-xl">CodeVeda revolutionizes healthcare by seamlessly integrating AYUSH traditional <br /> medicine with modern biomedicine through intelligent dual coding using <br />NAMASTE and ICD-11 standards.</p>
                </div>

            </div>

            <div className="flex items-center justify-center mt-10 gap-8">

                <span className="rounded-full flex items-center px-10 py-5 font-bold text-white bg-gradient-to-r from-[#0a5614] to-[#d2ae2e] transition-transform hover:-translate-y-1.5 hover:shadow-lg duration-500 cursor-pointer">

                    <i class="fa-solid fa-rocket"></i>
                    <p>Get Started</p>

                </span>

                <span className="border rounded-full flex items-center px-10 py-5 font-bold text-[#017be8] hover:text-white hover:bg-[#017be8] transition duration-500 cursor-pointer">

                    <i class="fa-solid fa-play"></i>
                    <p>Watch Demo</p>

                </span>

            </div>

            <div className="grid grid-cols-3 gap-5 px-[10%] py-13 ">

                <div className="rounded-2xl transition duration-500 hover:shadow-xl px-7 py-7 bg-white border border-[#e6eee7] ">

                    <div className="rounded-full bg-gradient-to-r from-[#0a5614] to-[#d2ae2e] w-16 h-16 flex justify-center items-center text-2xl text-white">

                        <i className="fa-notdog fa-solid fa-arrow-right-arrow-left "></i>

                    </div>

                    <p className="my-5 font-bold text-[#0a5614] text-2xl">Seamless Interoperability</p>

                    <p>Bridge the gap between traditional AYUSH practices and modern medical systems with intelligent code mapping.</p>

                    <div className="mt-6">
                        <i class="fa-solid fa-check"></i>
                        <span>NAMASTE to ICD-11 mapping</span><br />

                        <i class="fa-solid fa-check"></i>
                        <span>Real-time code validation</span><br />

                        <i class="fa-solid fa-check"></i>
                        <span>Cross-system compatibility</span>
                    </div>

                </div>

                <div className="rounded-2xl transition duration-500 hover:shadow-xl px-7 py-7 bg-white border border-[#e5edfa]">

                    <div className="rounded-full bg-gradient-to-r from-[#017be8] to-blue-300 w-16 h-16 flex justify-center items-center text-2xl text-white">
                        <i class="fa-sharp fa-solid fa-shield-halved"></i>
                    </div>

                    <p className="my-5 font-bold text-blue-500 text-2xl">Regulatory Compliance</p>

                    <p>Ensure full compliance with international healthcare standards while preserving traditional medicine authenticity.</p>

                    <div className="mt-6">

                        <i class="fa-solid fa-check"></i>
                        <span>WHO ICD-11 compliant</span><br />

                        <i class="fa-solid fa-check"></i>
                        <span>AYUSH ministry approved</span><br />

                        <i class="fa-solid fa-check"></i>
                        <span>International standards</span>

                    </div>

                </div>

                <div className=" rounded-2xl transition duration-500 hover:shadow-xl px-7 py-7 bg-white border border-[#e6eee7]">

                    <div className="rounded-full bg-gradient-to-r from-[#0a5614] to-[#d2ae2e] w-16 h-16 flex justify-center items-center text-2xl text-white">
                        <i class="fa-solid fa-heart"></i>
                    </div>

                    <p className="my-5 font-bold text-[#0a5614] text-2xl">Enhanced Patient Care</p>

                    <p>Deliver comprehensive healthcare by combining the best of traditional wisdom and modern medical science.</p>

                    <div className="mt-6">

                        <i class="fa-solid fa-check"></i>
                        <span>Holistic treatment approach</span><br />

                        <i class="fa-solid fa-check"></i>
                        <span>Complete medical history</span><br />

                        <i class="fa-solid fa-check"></i>
                        <span>Improved outcomes</span><br />

                    </div>

                </div>

            </div>

        </div>
    )
}


function Info() {
    return (
        <div className="bg-gradient-to-br from-[#f9efd5] to-white pb-15">

            <div className="py-20 text-center">

                <p className="text-4xl font-bold mb-4 text-[#0a5614]">Comprehensive Healthcare Integration</p>

                <p className="text-lg">Explore our powerful features designed to unify traditional and modern medical <br /> practices</p>

            </div>

            <div className="flex justify-center items-center gap-10 mx-45">

                <div className="p-10 rounded-2xl bg-gradient-to-br from-[#f9f0d7] to-white shadow-lg">

                    <img src={image1} alt="" className="w-120 h-80 rounded-2xl object-cover" />

                </div>

                <div className="inline">
                    <span className="bg-[#f5e8c3] rounded-full text-[#0a5614] font-medium p-2.5">

                        <i class="fa-solid fa-leaf"></i>

                        <span>       Traditional Medicine</span>

                    </span>

                    <div>


                        <p className="font-bold text-3xl text-[#0a5614] my-8">AYUSH Integration</p>

                        <p>Seamlessly incorporate Ayurveda, Yoga, Unani, Siddha, and Homeopathy <br /> practices into modern healthcare workflows with our intelligent coding <br /> system.</p>
                    </div>
                    <div className="my-5">
                        <div className="flex items-center gap-6 my-2">

                            <span className="rounded-full bg-[#d2ae2e] w-10 h-10 flex justify-center items-center text-lg text-white">
                                <i class="fa-solid fa-check"></i>
                            </span>
                            <span>Complete NAMASTE code library</span>

                        </div>

                        <div className="flex items-center gap-6 my-2">

                            <span className="rounded-full bg-[#d2ae2e] w-10 h-10 flex justify-center items-center text-lg text-white">
                                <i class="fa-solid fa-check"></i>
                            </span>
                            <span>Traditional diagnosis mapping</span>

                        </div>


                        <div className="flex items-center gap-6 my-2">

                            <span className="rounded-full bg-[#d2ae2e] w-10 h-10 flex justify-center items-center text-lg text-white">
                                <i class="fa-solid fa-check"></i>
                            </span>
                            <span>Herbal medicine database</span>

                        </div>



                    </div>

                </div>

            </div>

            <div className="flex justify-center items-center gap-10 mx-45 mt-30">

                <div>

                    <span className="bg-[#c9dbee] rounded-full text-[#017be8] font-medium p-2.5 ">

                        <i class="fa-solid fa-microscope"></i>
                        <span>       Modern Medicin</span>

                    </span>

                    <p className="font-bold text-3xl text-[#017be8] my-8">ICD-11 Compliance</p>

                    <p>Full integration with the latest WHO International Classification of Diseases ensuring global healthcare compatibility and standardization.</p>

                    <div>

                        <div className="flex items-center gap-6 my-2">

                            <div className="rounded-full bg-[#017be8] w-10 h-10 flex justify-center items-center text-lg text-white">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <span>WHO ICD-11 certified codes</span>

                        </div>

                        <div className="flex items-center gap-6 my-2">

                            <div className="rounded-full bg-[#017be8] w-10 h-10 flex justify-center items-center text-lg text-white">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <span>Global healthcare standards</span>

                        </div>

                        <div className="flex items-center gap-6 my-2">

                            <div className="rounded-full bg-[#017be8] w-10 h-10 flex justify-center items-center text-lg text-white">
                                <i class="fa-solid fa-check"></i>
                            </div>
                            <span>International interoperability</span>

                        </div>

                    </div>

                </div>

                <div className="p-10 rounded-2xl bg-gradient-to-br from-[#c9dbee] to-white shadow-lg">
                    <img src="src/components/images/image2.png" alt="" className="w-150 h-80 rounded-2xl object-cover"  />
                </div>

            </div>

        </div>
    )
}