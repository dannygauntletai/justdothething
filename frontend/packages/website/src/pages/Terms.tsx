import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Terms = () => {
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
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="text-sm text-gray-500 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="prose max-w-none">
              <p className="mb-4">
                These Terms of Service ("Terms") govern your access to and use of the JustDoTheThing.ai application and related services (collectively, the "Services") provided by JustDoTheThing.ai ("Company," "we," "us," or "our"). Please read these Terms carefully before using our Services.
              </p>
              
              <p className="mb-4">
                By accessing or using our Services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use the Services.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">1. Eligibility</h2>
              <p className="mb-4">
                You must be at least 18 years of age to access or use our Services. This age requirement is due in part to the nature of our text-to-speech functionality, which may occasionally generate vulgar or mature language. By accessing or using our Services, you represent and warrant that you are at least 18 years of age and have the legal capacity to enter into these Terms. If you are accessing or using our Services on behalf of a company, organization, or other entity, you represent and warrant that you have the authority to bind that entity to these Terms.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">2. Account Registration</h2>
              <p className="mb-4">
                To access certain features of our Services, you may be required to register for an account. When you register for an account, you agree to provide accurate, current, and complete information about yourself. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account or any other breach of security.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">3. Use of Services</h2>
              <p className="mb-4">
                Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, and revocable license to access and use our Services for your personal or internal business purposes.
              </p>
              <p className="mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Use the Services in any manner that could interfere with, disrupt, negatively affect, or inhibit other users from fully enjoying the Services, or that could damage, disable, overburden, or impair the functioning of the Services;</li>
                <li>Use the Services to violate applicable law, including but not limited to copyright and trademark laws;</li>
                <li>Attempt to circumvent any content-filtering techniques, security measures, or access controls that we employ;</li>
                <li>Use the Services for any illegal or unauthorized purpose, or engage in, encourage, or promote any activity that violates these Terms;</li>
                <li>Modify, adapt, translate, reverse engineer, decompile, disassemble, or create derivative works based on the Services;</li>
                <li>Use automated scripts, bots, spiders, crawlers, or scrapers to collect information from or otherwise interact with the Services;</li>
                <li>Attempt to gain unauthorized access to other computer systems through the Services;</li>
                <li>Interfere with another user's use and enjoyment of the Services;</li>
                <li>Engage in any harassing, intimidating, predatory, or stalking conduct;</li>
                <li>Impersonate or misrepresent your affiliation with any person or entity.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">4. Text-to-Speech Functionality and Mature Content</h2>
              <p className="mb-4">
                Our Services include text-to-speech functionality that converts text into spoken audio. You acknowledge and agree that:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>The text-to-speech functionality may occasionally generate vulgar, explicit, or mature language, even when not explicitly requested;</li>
                <li>We do not have complete control over the specific words or phrases that may be generated by the text-to-speech system;</li>
                <li>You are responsible for any consequences that may arise from playing audio generated by our Services in public or shared spaces;</li>
                <li>You will not intentionally manipulate inputs to generate offensive, harmful, or inappropriate audio content;</li>
                <li>You will use discretion when using the text-to-speech functionality in the presence of minors or in professional settings.</li>
              </ul>
              <p className="mb-4">
                If you encounter inappropriate content generated by our text-to-speech functionality, we encourage you to report it to us at justdothethingai@gmail.com so we can improve our systems.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">5. User Content</h2>
              <p className="mb-4">
                Our Services may allow you to create, upload, store, send, or receive content, including but not limited to text, images, audio, and other materials (collectively, "User Content"). You retain all rights in and to your User Content, and you are solely responsible for your User Content and the consequences of posting or publishing it.
              </p>
              <p className="mb-4">
                By submitting User Content to the Services, you grant us a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, perform, and display your User Content in connection with operating and providing the Services.
              </p>
              <p className="mb-4">
                You represent and warrant that:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>You own or have the necessary rights, licenses, consents, and permissions to use and authorize us to use your User Content as described in these Terms;</li>
                <li>Your User Content does not violate or infringe upon the intellectual property rights or other rights of any third party;</li>
                <li>Your User Content does not violate any applicable laws or regulations.</li>
              </ul>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">6. Privacy</h2>
              <p className="mb-4">
                Our collection and use of information about you is governed by our <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference. By using our Services, you consent to our collection, use, and disclosure of information as described in our Privacy Policy.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">7. Intellectual Property</h2>
              <p className="mb-4">
                The Services, including all content, features, and functionality thereof, are owned by the Company, its licensors, or other providers and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p className="mb-4">
                These Terms do not grant you any right, title, or interest in the Services or any content, features, or functionality thereof, other than the limited license to use the Services in accordance with these Terms.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">8. Feedback</h2>
              <p className="mb-4">
                We welcome feedback, comments, and suggestions for improvements to the Services ("Feedback"). You grant us a non-exclusive, worldwide, perpetual, irrevocable, fully-paid, royalty-free, sublicensable, and transferable license under any and all intellectual property rights that you own or control to use, copy, modify, create derivative works based upon, and otherwise exploit the Feedback for any purpose.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">9. Termination</h2>
              <p className="mb-4">
                We reserve the right to suspend or terminate your access to the Services, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach these Terms. Upon termination, your right to use the Services will immediately cease.
              </p>
              <p className="mb-4">
                All provisions of these Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">10. Disclaimer of Warranties</h2>
              <p className="mb-4">
                THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES ARE ERROR-FREE, THAT ACCESS THERETO WILL BE UNINTERRUPTED, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICES OR THE SERVERS THAT MAKE THE SERVICES AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">11. Limitation of Liability</h2>
              <p className="mb-4">
                IN NO EVENT SHALL WE, OUR AFFILIATES, DIRECTORS, EMPLOYEES, AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM (I) YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES; (II) ANY CONDUCT OR CONTENT OF ANY THIRD PARTY ON THE SERVICES; (III) ANY CONTENT OBTAINED FROM THE SERVICES; AND (IV) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH DAMAGE, AND EVEN IF A REMEDY SET FORTH HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.
              </p>
              <p className="mb-4">
                IN NO EVENT SHALL OUR AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATING TO THE SERVICES EXCEED THE GREATER OF (I) THE AMOUNT YOU PAID US TO USE THE SERVICES IN THE TWELVE (12) MONTHS PRIOR TO THE EVENT GIVING RISE TO LIABILITY OR (II) ONE HUNDRED DOLLARS ($100).
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">12. Indemnification</h2>
              <p className="mb-4">
                You agree to defend, indemnify, and hold harmless the Company, its affiliates, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from: (i) your use of and access to the Services; (ii) your violation of any term of these Terms; (iii) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or (iv) any claim that your User Content caused damage to a third party.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">13. Governing Law and Jurisdiction</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. You agree to submit to the personal and exclusive jurisdiction of the courts located in San Francisco County, California.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">14. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify or replace these Terms at any time in our sole discretion. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>
              <p className="mb-4">
                By continuing to access or use our Services after those revisions become effective, you agree to be bound by the revised Terms. If you do not agree to the new Terms, please stop using the Services.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">15. Severability</h2>
              <p className="mb-4">
                If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck and the remaining provisions shall be enforced to the fullest extent under law.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">16. Entire Agreement</h2>
              <p className="mb-4">
                These Terms, together with the Privacy Policy, constitute the entire agreement between you and the Company regarding the Services and supersede all prior agreements and understandings, whether written or oral, regarding the Services.
              </p>
              
              <h2 className="text-xl font-semibold mt-6 mb-4">17. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us at:
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

export default Terms; 