export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About ServEx</h1>
          <p className="text-xl text-blue-100">Connecting you with the best services and stores</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            At ServEx, we're on a mission to revolutionize the way people access on-demand services and products. 
            We believe that convenience shouldn't come at the cost of quality, and that's why we've partnered 
            with the best local businesses to bring you exceptional service, every time.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Whether you're craving your favorite meal, need groceries delivered, or require any service, 
            ServEx is here to make your life easier with just a few taps.
          </p>
        </section>

        {/* Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-3 text-pink-600">Quality</h3>
              <p className="text-gray-700">
                We partner only with the best stores and service providers to ensure top-notch quality in everything we deliver.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-pink-600">Speed</h3>
              <p className="text-gray-700">
                Time is precious. We optimize every step of the delivery process to get your orders to you as quickly as possible.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-pink-600">Trust</h3>
              <p className="text-gray-700">
                Your satisfaction and security are our top priorities. We're committed to building lasting relationships based on trust.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-gray-50 rounded-2xl p-8 mb-16">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">500+</div>
              <div className="text-gray-600">Partner Stores</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">50K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">100K+</div>
              <div className="text-gray-600">Orders Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-600 mb-2">4.8★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Join Our Team</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            We're always looking for talented individuals who share our passion for excellence and innovation. 
            If you want to be part of a team that's changing the way people shop and access services, 
            we'd love to hear from you.
          </p>
          <a 
            href="/contact"
            className="inline-block bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700"
          >
            Get in Touch
          </a>
        </section>
      </div>
    </div>
  );
}
