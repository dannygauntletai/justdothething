import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">JustDoTheThing.ai</h1>
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline" size="sm">Log in</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="prose max-w-none">
              <p className="mb-4">
                This Privacy Policy describes how JustDoTheThing.ai ("we," "us," or "our") collects, uses, and handles your information when you use our productivity application and related services (collectively, the "Services"). Please read this Privacy Policy carefully.
              </p>

              <h2 className="text-xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
              <p className="mb-2">
                We collect limited personal information to provide and improve our Services:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Account Information: When you register, we collect your name, email address, and authentication information associated with your Google account.</li>
                <li>User-Generated Content: We collect tasks, transcriptions, summaries, and related information you create or provide while using our Services.</li>
                <li>Usage Data: We collect information about how you interact with our Services, including your usage patterns and preferences.</li>
                <li>Device Information: We collect device-specific information such as your device type, operating system, and browser type.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">2. Local Processing and Screenshot Policy</h2>
              <p className="mb-2">
                <strong>Important:</strong> Our application employs privacy-by-design principles:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li><strong>Screenshots are processed entirely locally</strong> on your device. The actual content of your screenshots is never transmitted to our servers.</li>
                <li>When you use our Yell Mode, only metadata about screenshots (such as classification labels and timestamps) may be stored on our servers. This metadata contains no visual content from your screen.</li>
                <li>The metadata we store is limited to identifiers, timestamps, classification labels, and confidence scores – never the screenshot itself.</li>
                <li>All visual processing occurs on your device, ensuring your screen content remains private.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">3. How We Use Your Information</h2>
              <p className="mb-2">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>To provide, maintain, and improve our Services</li>
                <li>To personalize your experience and deliver features that may interest you</li>
                <li>To develop new products, services, and features</li>
                <li>To communicate with you about our Services, including updates and notifications</li>
                <li>To protect the safety, integrity, and security of our Services and users</li>
                <li>To comply with legal obligations</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">4. Data Storage and Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">5. Data Retention</h2>
              <p className="mb-4">
                We retain your information only as long as necessary to provide you with our Services and for legitimate business purposes, such as maintaining performance of the Services, making data-driven business decisions about new features, complying with our legal obligations, and resolving disputes.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to track activity on our Services and to hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some parts of our Services may not function properly.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">7. Third-Party Services</h2>
              <p className="mb-4">
                Our Services may contain links to third-party websites or services that are not owned or controlled by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. We encourage you to review the privacy policies of any third-party websites or services that you visit from our Services.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">8. Your Rights</h2>
              <p className="mb-2">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>The right to access, update, or delete your information</li>
                <li>The right to rectification if your information is inaccurate or incomplete</li>
                <li>The right to object to our processing of your information</li>
                <li>The right to request restriction of processing your information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent where we rely on consent to process your information</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us using the information provided at the end of this Privacy Policy.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">9. Children's Privacy</h2>
              <p className="mb-4">
                Our Services are not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will take steps to delete such information as soon as possible.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">11. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="mb-4">
                Email: justdothethingai@gmail.com
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400 text-sm">
            © 2025 JustDoTheThing.ai
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Privacy; 