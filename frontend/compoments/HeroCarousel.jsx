import Slider from "react-slick";

const slides = [
    { title: "Welcome to MyShop", subtitle: "Best products just for you", image: "https://via.placeholder.com/1200x400" },
    { title: "Latest Gadgets", subtitle: "Check out our new arrivals", image: "https://via.placeholder.com/1200x400" },
    { title: "Special Offers", subtitle: "Limited time deals", image: "https://via.placeholder.com/1200x400" },
];

export default function HeroCarousel() {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 4000,
    };

    return (
        <section className="mt-4">
            <Slider {...settings}>
                {slides.map((slide, idx) => (
                    <div key={idx} className="relative">
                        <img src={slide.image} alt={slide.title} className="w-full h-80 md:h-96 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center text-white px-4">
                            <h2 className="text-3xl md:text-5xl font-bold">{slide.title}</h2>
                            <p className="mt-2 text-lg md:text-2xl">{slide.subtitle}</p>
                        </div>
                    </div>
                ))}
            </Slider>
        </section>
    );
}
