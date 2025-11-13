'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "Honda of Los Angeles",
    content: "Our AIV score jumped from 62 to 89 in just 3 weeks. The AI visibility insights are game-changing.",
    avatar: "SC",
    rating: 5
  },
  {
    name: "Mike Rodriguez",
    role: "General Manager", 
    company: "BMW Miami",
    content: "Finally, a tool that shows us exactly how we appear in AI responses. ROI was immediate.",
    avatar: "MR",
    rating: 5
  },
  {
    name: "Jennifer Kim",
    role: "Digital Marketing Manager",
    company: "Toyota Seattle",
    content: "The E-E-A-T analysis helped us optimize our content strategy. Highly recommend!",
    avatar: "JK",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Leading Dealerships
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers say about their AI visibility improvements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="relative mb-6">
                <Quote className="absolute -top-2 -left-2 w-8 h-8 text-blue-100" />
                <p className="text-gray-700 text-sm leading-relaxed pl-4">
                  "{testimonial.content}"
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 text-xs">
                    {testimonial.role}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logos */}
        <div className="mt-16">
          <p className="text-center text-gray-500 text-sm mb-8">
            Trusted by 500+ dealerships nationwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {['Honda', 'Toyota', 'BMW', 'Mercedes', 'Ford', 'Audi'].map((brand, index) => (
              <div
                key={index}
                className="text-2xl font-bold text-gray-400"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
