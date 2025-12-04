export default function Cookies() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-gray-600 mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files that are placed on your device when you visit a website.
              They are widely used to make websites work more efficiently and provide information to
              the website owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bugbear uses cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>
                <strong>Essential Cookies:</strong> Required for the platform to function properly,
                including authentication and security features
              </li>
              <li>
                <strong>Performance Cookies:</strong> Help us understand how visitors interact with
                our platform to improve performance
              </li>
              <li>
                <strong>Functionality Cookies:</strong> Remember your preferences and settings
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us analyze usage patterns and improve user
                experience
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can control and manage cookies in various ways. Please keep in mind that removing
              or blocking cookies may impact your user experience and parts of our platform may no
              longer be accessible.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Most browsers allow you to refuse or accept cookies. You can also delete cookies that
              have already been set. Consult your browser's help documentation for instructions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              In addition to our own cookies, we may also use various third-party cookies to report
              usage statistics and deliver advertisements. These third parties may use cookies to
              collect information about your online activities across different websites.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about our Cookie Policy, please contact us at{' '}
              <a href="mailto:privacy@bugbear.in" className="text-indigo-600 hover:underline">
                privacy@bugbear.in
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

