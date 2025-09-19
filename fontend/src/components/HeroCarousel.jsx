import Slider from "react-slick";

const slides = [
    { image: "https://via.placeholder.com/1200x400?text=Slide+1", title: "Big Sale!", subtitle: "Up to 50% Off" },
    { image: "https://via.placeholder.com/1200x400?text=Slide+2", title: "New Arrivals", subtitle: "Check our products" },
];

export default function HeroCarousel() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    return (
        <Slider {...settings} className="mb-10">
            {slides.map((s, idx) => (
                <div key={idx} className="relative">
                    <img src={s.image} alt={s.title} className="w-full h-96 object-cover rounded-lg"/>
                    <div className="absolute inset-0 flex flex-col justify-center items-center text-white bg-black/30">
                        <h2 className="text-4xl md:text-6xl font-bold">{s.title}</h2>
                        <p className="text-lg md:text-2xl mt-2">{s.subtitle}</p>
                        <button className="mt-4 bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 transition">
                            Shop Now
                        </button>
                    </div>
                </div>
            ))}
        </Slider>
    );
}
