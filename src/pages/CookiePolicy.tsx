import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 text-gold hover:text-gold/80 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        </div>

        <div className="prose prose-gray max-w-none space-y-6">
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">About Cookies & What They Mean</h2>
            <p className="text-muted-foreground">
              This website is owned and operated by VIP Transport and Security. Our Site uses Cookies and similar technologies in order to distinguish you from other users. By using Cookies, We are able to provide you with a better experience and to improve Our Site by better understanding how you use it. Please read this Cookie Policy carefully and ensure that you understand it. Your acceptance of Our Cookie Policy is deemed to occur if you continue using Our Site. If you do not agree to Our Cookie Policy, please stop using Our Site immediately.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">1. Definitions and Interpretation</h2>
            <p className="text-muted-foreground">In this Cookie Policy, unless the context otherwise requires, the following expressions have the following meanings:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>"Cookie"</strong> - Means a small file placed on your computer or device by Our Site when you visit certain parts of Our Site and/or when you use certain features of Our Site;</li>
              <li><strong>"Cookie Law"</strong> - Means the relevant parts of the Privacy and Electronic Communications (EC Directive) Regulations 2003 and of EU Regulation 2016/679 General Data Protection Regulation ("GDPR");</li>
              <li><strong>"Personal Data"</strong> - Means any and all data that relates to an identifiable person who can be directly or indirectly identified from that data, as defined by the Data Protection Act 1998 and EU Regulation 2016/679 General Data Protection Regulation ("GDPR"); and</li>
              <li><strong>"We/Us/Our"</strong> - Means VIP Transport and Security.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">2. Information About Us</h2>
            <p className="text-muted-foreground">
              Our Site is owned and operated by VIP Transport and Security.
            </p>
            <p className="text-muted-foreground">
              Our Data Protection Officer can be contacted by email, telephone, or by post as per our contact page.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">3. How Does Our Site Use Cookies?</h2>
            <p className="text-muted-foreground">
              Our Site may place and access certain first party Cookies on your computer or device. First party Cookies are those placed directly by Us and are used only by Us. We use Cookies to facilitate and improve your experience of Our Site and to provide and improve Our products and services. We have carefully chosen these Cookies and have taken steps to ensure that your privacy and personal data is protected and respected at all times.
            </p>
            <p className="text-muted-foreground">
              By using Our Site, you may also receive certain third party Cookies on your computer or device. Third party Cookies are those placed by websites, services, and/or parties other than Us. Third party Cookies are used on Our Site for analytics tracking, and storage of customer basket sessions. For more details, please refer to section 4 below.
            </p>
            <p className="text-muted-foreground">
              All Cookies used by and on Our Site are used in accordance with current Cookie Law. We may use some or all of the following types of Cookie:
            </p>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-lg font-medium text-gold">3.1 Strictly Necessary Cookies</h4>
                <p className="text-muted-foreground">
                  A Cookie falls into this category if it is essential to the operation of Our Site, supporting functions such as logging in, your shopping basket, and payment transactions.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gold">3.2 Analytics Cookies</h4>
                <p className="text-muted-foreground">
                  It is important for Us to understand how you use Our Site, for example, how efficiently you are able to navigate around it, and what features you use. Analytics Cookies enable us to gather this information, helping Us to improve Our Site and your experience of it.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gold">3.3 Functionality Cookies</h4>
                <p className="text-muted-foreground">
                  Functionality Cookies enable Us to provide additional functions to you on Our Site such as personalisation and remembering your saved preferences. Some functionality Cookies may also be strictly necessary Cookies, but not all necessarily fall into that category.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gold">3.4 Targeting Cookies</h4>
                <p className="text-muted-foreground">
                  It is important for Us to know when and how often you visit Our Site, and which parts of it you have used (including which pages you have visited and which links you have visited). As with analytics Cookies, this information helps us to better understand you and, in turn, to make Our Site and advertising more relevant to your interests.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gold">3.5 Third Party Cookies</h4>
                <p className="text-muted-foreground">
                  Third party Cookies are not placed by Us; instead, they are placed by third parties that provide services to Us and/or to you. Third party Cookies may be used by advertising services to serve up tailored advertising to you on Our Site, or by third parties providing analytics services to Us.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gold">3.6 Persistent Cookies</h4>
                <p className="text-muted-foreground">
                  Any of the above types of Cookie may be a persistent Cookie. Persistent Cookies are those which remain on your computer or device for a predetermined period and are activated each time you visit Our Site.
                </p>
              </div>
              
              <div>
                <h4 className="text-lg font-medium text-gold">3.7 Session Cookies</h4>
                <p className="text-muted-foreground">
                  Any of the above types of Cookie may be a session Cookie. Session Cookies are temporary and only remain on your computer or device from the point at which you visit Our Site until you close your browser. Session Cookies are deleted when you close your browser.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">4. What Cookies Does Our Site Use?</h2>
            
            <div className="space-y-4">
              <h3 className="text-xl font-medium">4.1 First Party Cookies</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Name of Cookie</th>
                      <th className="border border-border p-2 text-left">Purpose & Type</th>
                      <th className="border border-border p-2 text-left">Strictly Necessary</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2 text-muted-foreground">-</td>
                      <td className="border border-border p-2 text-muted-foreground">-</td>
                      <td className="border border-border p-2 text-muted-foreground">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-medium">4.2 Third Party Cookies</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-left">Name of Cookie</th>
                      <th className="border border-border p-2 text-left">Purpose & Type</th>
                      <th className="border border-border p-2 text-left">Provider</th>
                      <th className="border border-border p-2 text-left">Strictly Necessary</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-2 text-muted-foreground">_ga</td>
                      <td className="border border-border p-2 text-muted-foreground">Analytics Tracking</td>
                      <td className="border border-border p-2 text-muted-foreground">Google</td>
                      <td className="border border-border p-2 text-muted-foreground">No</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2 text-muted-foreground">_gat</td>
                      <td className="border border-border p-2 text-muted-foreground">Analytics Tracking</td>
                      <td className="border border-border p-2 text-muted-foreground">Google</td>
                      <td className="border border-border p-2 text-muted-foreground">No</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-2 text-muted-foreground">_gid</td>
                      <td className="border border-border p-2 text-muted-foreground">Analytics Tracking</td>
                      <td className="border border-border p-2 text-muted-foreground">Google</td>
                      <td className="border border-border p-2 text-muted-foreground">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-muted-foreground">
              Our Site uses analytics services provided by Google. Website analytics refers to a set of tools used to collect and analyse anonymous usage information, enabling Us to better understand how Our Site is used. This, in turn, enables Us to improve Our Site and the products and services offered through it.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">5. Consent and Control</h2>
            <p className="text-muted-foreground">
              Before Cookies are placed on your computer or device, you will be shown a cookie popup requesting your consent to set those Cookies. By giving your consent to the placing of Cookies you are enabling Us to provide the best possible experience and service to you. You may, if you wish, deny consent to the placing of Cookies unless those Cookies are strictly necessary; however certain features of Our Site may not function fully or as intended.
            </p>
            <p className="text-muted-foreground">
              In addition to the controls that We provide, you can choose to enable or disable Cookies in your internet browser. Most internet browsers also enable you to choose whether you wish to disable all Cookies or only third party Cookies. By default, most internet browsers accept Cookies but this can be changed. For further details, please consult the help menu in your Internet browser or the documentation that came with your device.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">6. Changes to this Cookie Policy</h2>
            <p className="text-muted-foreground">
              We may alter this Cookie Policy at any time. Any such changes will become binding on you on your first use of Our Site after the changes have been made. You are therefore advised to check this page from time to time.
            </p>
            <p className="text-muted-foreground">
              In the event of any conflict between the current version of this Cookie Policy and any previous version(s), the provisions current and in effect shall prevail unless it is expressly stated otherwise.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
