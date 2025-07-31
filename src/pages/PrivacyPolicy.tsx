import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        </div>

        <div className="prose prose-gray max-w-none space-y-6">
          <p className="text-muted-foreground">
            VIP Transport and Security understands that your privacy is important to you and that you care about how your personal data is used. We respect and value the privacy of everyone who visits this website ("Our Site"), and will only collect and use personal data in ways that are described here, and in a way that is consistent with our obligations and your rights under the law.
          </p>
          
          <p className="text-muted-foreground">
            Please read this Privacy Policy carefully and ensure that you understand it. Your acceptance of this Privacy Policy is deemed to occur upon your first use of Our Site. If you do not accept and agree with this Privacy Policy, you must stop using Our Site immediately.
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">1. Definitions and Interpretation</h2>
            <p className="text-muted-foreground">In this Policy the following terms shall have the following meanings:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li><strong>"Account"</strong> - means an account required to access and/or use certain areas and features of Our Site;</li>
              <li><strong>"Cookie"</strong> - means a small text file placed on your computer or device by Our Site when you visit certain parts of Our Site and/or when you use certain features of Our Site. Details of the Cookies used by Our Site are set out in Part 14, below; and</li>
              <li><strong>"Cookie Law"</strong> - means the relevant parts of the Privacy and Electronic Communications (EC Directive) Regulations 2003;</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">2. Information About Us</h2>
            <p className="text-muted-foreground">
              Our Site is owned and operated by VIP Transport and Security. Find our full details on our contact page.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">3. What Does This Policy Cover?</h2>
            <p className="text-muted-foreground">
              This Privacy Policy applies only to your use of Our Site. Our Site may contain links to other websites. Please note that we have no control over how your data is collected, stored, or used by other websites and we advise you to check the privacy policies of any such websites before providing any data to them.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">4. What is Personal Data?</h2>
            <p className="text-muted-foreground">
              Personal data is defined by the General Data Protection Regulation (EU Regulation 2016/679) (the "GDPR") as 'any information relating to an identifiable person who can be directly or indirectly identified in particular by reference to an identifier'.
            </p>
            <p className="text-muted-foreground">
              Personal data is, in simpler terms, any information about you that enables you to be identified. Personal data covers obvious information such as your name and contact details, but it also covers less obvious information such as identification numbers, electronic location data, and other online identifiers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">5. What Are My Rights?</h2>
            <p className="text-muted-foreground">Under the GDPR, you have the following rights, which we will always work to uphold:</p>
            <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
              <li>The right to be informed about our collection and use of your personal data. This Privacy Policy should tell you everything you need to know, but you can always contact us to find out more or to ask any questions using the details in Part 15.</li>
              <li>The right to access the personal data we hold about you. Part 13 will tell you how to do this.</li>
              <li>The right to have your personal data rectified if any of your personal data held by us is inaccurate or incomplete. Please contact us using the details in Part 15 to find out more.</li>
              <li>The right to be forgotten, i.e. the right to ask us to delete or otherwise dispose of any of your personal data that we have. Please contact us using the details in Part 15 to find out more.</li>
              <li>The right to restrict (i.e. prevent) the processing of your personal data.</li>
              <li>The right to object to us using your personal data for a particular purpose or purposes.</li>
              <li>The right to data portability. This means that, if you have provided personal data to us directly, we are using it with your consent or for the performance of a contract, and that data is processed using automated means, you can ask us for a copy of that personal data to re-use with another service or business in many cases.</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">6. What Data Do We Collect?</h2>
            <p className="text-muted-foreground">
              Depending upon your use of Our Site, we may collect some or all of the following personal and non-personal data (please also see Part 14 on our use of Cookies and similar technologies and our Cookie Policy):
            </p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Name</li>
              <li>Date of Birth</li>
              <li>Gender</li>
              <li>Address</li>
              <li>Email address</li>
              <li>Telephone number</li>
              <li>Business name</li>
              <li>Personal information provided by you to us</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">7. How Do You Use My Personal Data?</h2>
            <p className="text-muted-foreground">
              Under the GDPR, we must always have a lawful basis for using personal data. This may be because the data is necessary for our performance of a contract with you, because you have consented to our use of your personal data, or because it is in our legitimate business interests to use it. Your personal data will be used for one of the following purposes:
            </p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Providing and managing your Account</li>
              <li>Providing and managing your access to Our Site</li>
              <li>Personalising and tailoring your experience on Our Site</li>
              <li>Supplying our services to you. Your personal details are required in order for us to enter into a contract with you</li>
              <li>Personalising and tailoring our services for you</li>
              <li>Communicating with you. This may include responding to emails or calls from you</li>
              <li>Supplying you with information by email and/or post that you have opted-in to (you may unsubscribe or opt-out at any time by writing to us confirming that you wish to opt out)</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">8. How Long Will You Keep My Personal Data?</h2>
            <p className="text-muted-foreground">
              We will not keep your personal data for any longer than is necessary in light of the reason(s) for which it was first collected. Your personal data will therefore be kept for the following periods:
            </p>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>A minimum of 6 years and a maximum of 12 years; or,</li>
              <li>Where we consider it necessary to retain your data for longer a longer period for instance might be:
                <ul className="ml-6 mt-2 space-y-1 list-disc list-inside">
                  <li>The requirements of our business and the services provided</li>
                  <li>Any statutory and legal obligations</li>
                </ul>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">9. How and Where Do You Store or Transfer My Personal Data?</h2>
            <p className="text-muted-foreground">
              We will only store or transfer your personal data within the European Economic Area (the "EEA"). This means that your personal data will be fully protected under the GDPR or to equivalent standards by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">10. Do You Share My Personal Data?</h2>
            <p className="text-muted-foreground">
              We contract with third parties to supply certain services. These may include payment processing, delivery, and marketing. In some cases, those third parties may require access to some or all of your personal data that we hold.
            </p>
            <p className="text-muted-foreground">
              If any of your personal data is required by a third party, as described above, we will take steps to ensure that your personal data is handled safely, securely, and in accordance with your rights, our obligations, and the third parties obligations under the law, as described above in Part 9.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">11. How Can I Control My Personal Data?</h2>
            <p className="text-muted-foreground">
              In addition to your rights under the GDPR, set out in Part 5, when you submit personal data via Our Site, you may be given options to restrict our use of your personal data. In particular, we aim to give you strong controls on our use of your data for direct marketing purposes (including the ability to opt-out of receiving emails from us which you may do by unsubscribing by emailing us through "contact us" on our website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">12. Can I Withhold Information?</h2>
            <p className="text-muted-foreground">
              You may access certain areas of Our Site without providing any personal data at all. However, to use all features and functions available on Our Site you may be required to submit or allow for the collection of certain data.
            </p>
            <p className="text-muted-foreground">
              You may restrict our use of Cookies. For more information, see Part 14 and our Cookie Policy.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">13. How Can I Access My Personal Data?</h2>
            <p className="text-muted-foreground">
              If you want to know what personal data we have about you, you can ask us for details of that personal data and for a copy of it (where any such personal data is held). This is known as a "subject access request".
            </p>
            <p className="text-muted-foreground">
              All subject access requests should be made in writing and sent to the email or postal addresses shown in Part 15. To make this as easy as possible for you, a Subject Access Request Form is available for you to use. You do not have to use this form, but it is the easiest way to tell us everything we need to know to respond to your request as quickly as possible.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">14. How Do You Use Cookies?</h2>
            <p className="text-muted-foreground">
              Our Site may place and access certain first-party Cookies on your computer or device. First-party Cookies are those placed directly by us and are used only by us. We use Cookies to facilitate and improve your experience of Our Site and to provide and improve our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">15. How Do I Contact You?</h2>
            <p className="text-muted-foreground">
              To contact us about anything to do with your personal data and data protection, including to make a subject access request, please use the following details on our contact page.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-gold">16. Changes to this Privacy Policy</h2>
            <p className="text-muted-foreground">
              We may change this Privacy Notice from time to time. This may be necessary, for example, if the law changes, or if we change our business in a way that affects personal data protection.
            </p>
            <p className="text-muted-foreground">
              Any changes will be immediately posted on Our Site and you will be deemed to have accepted the terms of the Privacy Policy on your first use of Our Site following the alterations. We recommend that you check this page regularly to keep up-to-date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
