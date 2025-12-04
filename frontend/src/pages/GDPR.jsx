export default function GDPR() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">GDPR Compliance</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-sm text-gray-600 mb-8">Last updated: January 2025</p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights Under GDPR</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you are located in the European Economic Area (EEA), you have certain data
              protection rights under the General Data Protection Regulation (GDPR). Bugbear aims
              to take reasonable steps to allow you to correct, amend, delete, or limit the use of
              your personal information.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>
                <strong>Access:</strong> Request copies of your personal data that we hold
              </li>
              <li>
                <strong>Rectification:</strong> Request correction of inaccurate or incomplete data
              </li>
              <li>
                <strong>Erasure:</strong> Request deletion of your personal data under certain
                circumstances
              </li>
              <li>
                <strong>Restrict Processing:</strong> Request restriction of processing your
                personal data
              </li>
              <li>
                <strong>Data Portability:</strong> Request transfer of your data to another service
                provider
              </li>
              <li>
                <strong>Object:</strong> Object to processing of your personal data
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw consent where we rely on consent for
                processing
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Exercising Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              To exercise any of these rights, please contact us at{' '}
              <a href="mailto:privacy@bugbear.in" className="text-indigo-600 hover:underline">
                privacy@bugbear.in
              </a>
              . We will respond to your request within 30 days.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You also have the right to lodge a complaint with a supervisory authority if you
              believe we have not addressed your concerns adequately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Processing</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We process your personal data based on the following legal grounds:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Performance of a contract (providing our services)</li>
              <li>Legitimate interests (improving our services, security)</li>
              <li>Consent (marketing communications, where applicable)</li>
              <li>Legal obligations (compliance with applicable laws)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal data only for as long as necessary to fulfill the purposes
              outlined in our Privacy Policy, unless a longer retention period is required or
              permitted by law.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about GDPR compliance or to exercise your rights, please contact our
              Data Protection Officer at{' '}
              <a href="mailto:dpo@bugbear.in" className="text-indigo-600 hover:underline">
                dpo@bugbear.in
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

