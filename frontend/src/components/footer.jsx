

export default function Footer() {
    return (
        <div className="bg-gradient-to-br from-[#0b5415] to-[#101e24]">

            <div className="grid grid-cols-4 pt-15 px-50 gap-10">

                <div>

                    <div className="pb-4">
                        <p className="font-bold text-2xl text-white">CodeVeda</p>
                        <p className="text-sm text-[#b6c8bb]">Traditional • Modern • Unified</p>
                    </div>

                    <div className="text-[#b6c8bb]">
                        Revolutionizing healthcare by seamlessly integrating traditional AYUSH medicine with modern biomedicine through intelligent dual coding.
                    </div>

                    <div className="flex gap-4 my-7">

                        <span className="bg-[#ffffff34] h-10 w-10 rounded-full backdrop-opacity-10 flex justify-center items-center cursor-pointer hover:bg-[#ffffff6c] transition duration-500">

                            <i class="fa-brands fa-linkedin text-white opacity-100"></i>

                        </span>

                        <span className="bg-[#ffffff34] h-10 w-10 rounded-full backdrop-opacity-10 flex justify-center items-center cursor-pointer hover:bg-[#ffffff6c] transition duration-500">

                            <i class="fa-brands fa-square-x-twitter text-white"></i>

                        </span>

                        <span className="bg-[#ffffff34] h-10 w-10 rounded-full backdrop-opacity-10 flex justify-center items-center cursor-pointer hover:bg-[#ffffff6c] transition duration-500">

                            <i class="fa-brands fa-square-facebook text-white"></i>

                        </span>

                        <span className="bg-[#ffffff34] h-10 w-10 rounded-full backdrop-opacity-10 flex justify-center items-center cursor-pointer hover:bg-[#ffffff6c] transition duration-500">

                            <i class="fa-brands fa-square-instagram text-white"></i>

                        </span>


                    </div>

                </div>

                <div className="text-[#b6c8bb]">

                    <p className="text-white text-xl font-semibold pb-4">Platform</p>

                    <div className="*:py-1.5 *:cursor-pointer *:hover:text-[#ffffff] *:transition duration-500">

                        <p>Dashboard</p>
                        <p>Code Mapping</p>
                        <p>EHR System</p>
                        <p>Analytics</p>
                        <p>API Documentation</p>
                        <p>Integration Guide</p>

                    </div>

                </div>

                <div className="text-[#b6c8bb]">

                    <p className="text-white text-xl font-semibold pb-4">Resources</p>

                    <div className="*:py-1.5 *:cursor-pointer *:hover:text-[#ffffff] *:transition duration-500">

                        <p>NAMASTE Codes</p>
                        <p>ICD-11 Standards</p>
                        <p>Training Materials</p>
                        <p>Best Practices</p>
                        <p>Case Studies</p>
                        <p>Research Papers</p>

                    </div>



                </div>

                <div className="text-[#b6c8bb]">

                    <p className="text-white text-xl font-semibold pb-4">Support</p>

                    <div className="*:py-1.5 *:cursor-pointer *:hover:text-[#ffffff] *:transition duration-500">

                        <p>Help Center</p>
                        <p>Contact Support</p>
                        <p>Community Form</p>
                        <p>Privacy Policy</p>
                        <p>Terms of Service</p>
                        <p>Security</p>

                    </div>


                </div>


            </div>

            <div className="mx-50 border-t text-[#b6c8bb]">

                <p className="py-6">© 2025 CodeVeda. All rights reserved. | Bridging Traditional and Modern Healthcare</p>
            </div>

        </div>
    )
}