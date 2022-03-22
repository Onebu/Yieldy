import React from 'react';

import bgImage from '../../assets/img/bg/background_1920-9.jpg';
const ProfileBg = props => {
    return (
        <main className="profile-page">
            <section className="relative block" style={{ height: "300px" }}>
                <div
                    className="absolute top-0 w-full h-full bg-center bg-cover"
                    style={{
                        backgroundImage:
                            `url(${bgImage})`
                    }}
                >
                    <span
                        id="blackOverlay"
                        className="w-full h-full absolute opacity-50 bg-black"
                    ></span>
                </div>
                <div
                    className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden"
                    style={{ height: "70px", transform: "translateZ(0)" }}
                >
                    <svg
                        className="absolute bottom-0 overflow-hidden"
                        preserveAspectRatio="none"
                        version="1.1"
                        viewBox="0 0 2560 100"
                        x="0"
                        y="0"
                    >
                        <polygon
                            className="text-light fill-current"
                            points="2960 0 2560 100 0 100"
                        ></polygon>
                    </svg>
                </div>
            </section>
            <section className="relative py-16 bg-transparent">
                <div className="container relative flex flex-col min-w-0 w-full  -mt-64 px-6">
                    {props.children}
                </div>
            </section>
        </main>
    )
}

export default ProfileBg;