import { useRef } from "react";
import { Printer, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function EmploymentAgreement() {
  const [, navigate] = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        .agreement-page {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: white;
          color: #1a1a1a;
          padding: 1rem;
          overflow-y: auto;
          width: 100vw;
          height: 100vh;
        }
        
        @media print {
          @page { 
            size: A4; 
            margin: 0.75in 0.75in;
          }
          
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          html, body, #root {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: #1a1a1a !important;
          }
          
          .agreement-page {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            width: auto !important;
            padding: 0 !important;
            background: white !important;
          }
          
          .print-wrapper {
            max-width: none !important;
          }
          
          .no-print {
            display: none !important;
          }
          
          .section {
            page-break-inside: avoid;
          }
          
          h1 { font-size: 1.25rem !important; }
          h2 { font-size: 1rem !important; }
          p, li { font-size: 0.8rem !important; line-height: 1.4 !important; }
        }
      `}</style>
      <div className="agreement-page">
        <div className="print-wrapper max-w-4xl mx-auto">
          <div className="sticky top-0 z-50 bg-white border-b border-gray-200 p-4 flex items-center justify-between no-print">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              data-testid="button-download-pdf"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>

          <div ref={contentRef} className="p-8 bg-white">
            {/* Header */}
            <div className="text-right mb-8 text-sm text-gray-600">
              <p className="font-semibold">Tenth Chapter Limited (trading as "Natter")</p>
              <p>Company Number: 12565130 (England & Wales)</p>
              <p>Aldwych House, 71-91 Aldwych, London, WC2B 4HN, United Kingdom</p>
            </div>

            <div className="text-center mb-8">
              <p className="text-sm">This agreement is dated .........................................................</p>
            </div>

            <p className="mb-6 text-sm">To: Nigel Bautista, Apartment 31, 51 Packington Street, London, N1 7FZ (nigel.zamudio.bautista@gmail.com)</p>

            <h1 className="text-2xl font-bold text-center mb-8">EMPLOYMENT AGREEMENT</h1>

            <p className="mb-4">Dear Nigel,</p>
            <p className="mb-4">We're delighted that you will be joining the Natter team!</p>
            <p className="mb-4">In this letter (the "Agreement") we set out the terms and conditions of your employment with Tenth Chapter Limited ("Natter", the "Company", "Tenth Chapter", "we", "us"), which constitutes your principal statement of employment particulars as required by employment law.</p>
            <p className="mb-4">Please read this letter carefully and sign once you've done so.</p>
            <p className="mb-4">In this letter "Group" refers to and includes the wider group of companies to which Tenth Chapter may belong from time to time.</p>
            <p className="mb-8">This offer of employment is in principle and pending successful application for the Skilled Worker visa in the UK.</p>

            {/* Section 1 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">1 START DATE</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>1.1</strong> The commencement date of your employment with Natter is 3 January 2023.</p>
                <p><strong>1.2</strong> No employment with a previous employer counts towards your period of continuous employment with Natter.</p>
                <p><strong>1.3</strong> Your employment is conditional upon completion of our pre-employment screening procedures (accessed here) which include verification of your identity, right to work in the United Kingdom, your criminal record status, your education and references with regards to any current and previous employment.</p>
              </div>
            </div>

            {/* Section 2 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">2 DUTIES</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>2.1</strong> You are employed as <strong>Senior SDET</strong>, where you shall perform the duties and exercise the powers which from time to time may be assigned to you or vested in you by the Company and shall devote the whole of your time, ability and attention to these duties under this Agreement.</p>
                <p><strong>2.2</strong> You may be required to undertake other duties from time to time as we may reasonably require.</p>
                <p><strong>2.3</strong> You confirm that you are entitled to work in the United Kingdom without any additional approvals and that you will tell us immediately if this changes.</p>
                <p><strong>2.4</strong> You agree not to work for anyone else while you are employed by Natter, other than by prior agreement with the Company.</p>
                <p><strong>2.5</strong> You shall use your utmost endeavours to promote the interests of the Company and shall not knowingly do or willingly permit to be done anything to the prejudice, loss or injury of the Company and shall carry out such duties in a competent manner.</p>
              </div>
            </div>

            {/* Section 3 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">3 SALARY AND EXPENSES</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>3.1</strong> Your basic salary is £90,000 per year which will accrue from day to day at a rate of 1/260 of your annual salary, which we will pay monthly in arrears in equal instalments less any statutory and voluntary deductions on or about the last working day of each month (or any new date that we tell you) directly into your bank account.</p>
                <p><strong>3.2</strong> Your salary will be reviewed annually. You will be advised of any increase in your salary in June and the new rate will be effective from 1 August for the following 12 months. Salary reviews are entirely at the Company's discretion and we reserve the right to retain your salary at the current level.</p>
                <p><strong>3.3</strong> In addition to your basic salary, you will be reimbursed all reasonable expenses properly and exclusively incurred by you in the performance of your duties for the Company, subject to you complying with our expenses policy from time to time in force.</p>
                <p><strong>3.4</strong> We may also deduct from your salary or other payments due to you, to the extent permitted by law, any money which you may owe to the Company at any time, and you hereby authorise and consent to any such deduction.</p>
                <p><strong>3.5</strong> You shall be entitled at any time to perform services not only for the Company but also for any Group company or the Company's shareholders without any entitlement to additional remuneration.</p>
                <p><strong>3.6</strong> You shall pay to the Company any sums owed upon our demand at any time, whether during your employment by us or after termination.</p>
                <p><strong>3.7</strong> You agree to indemnify the Company in relation to any income tax and employees' national insurance contributions not already deducted from your remuneration (or any taxes replacing the same) and any penalties, fines, charges, interests and costs thereon for which the Company has an obligation at any time to account (during your employment or after the Termination Date) in relation to your employment.</p>
              </div>
            </div>

            {/* Section 4 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">4 EQUITY INCENTIVE PLAN AND BONUS</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>4.1</strong> You will be eligible to participate in the Company's performance-based option scheme in accordance with Schedule One.</p>
                <p><strong>4.2</strong> We may award you a discretionary bonus under the Company bonus scheme. The amount and conditions of any award (including, but not limited to, conditions for and timing of payment) are at our absolute discretion. We may, at our absolute discretion, alter the terms of any bonus targets or withdraw them altogether at any time without prior notice. The Company reserves the right to award a nil bonus.</p>
                <p><strong>4.3</strong> Any bonus we award shall be purely discretionary, shall not form part of your contractual remuneration and shall not be pensionable. The making of an award will not oblige the Company to make any subsequent bonus awards.</p>
                <p><strong>4.4</strong> Notwithstanding clause 4.2, you shall have no right to be awarded or where an award has been made, paid a bonus (pro rata or otherwise) if:</p>
                <div className="ml-6">
                  <p>(a) you are subject to any capability and/or disciplinary procedures; and/or</p>
                  <p>(b) your employment has terminated (whether lawfully or unlawfully) or you are under notice of termination (whether given by you or the Company).</p>
                </div>
              </div>
            </div>

            {/* Section 5 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">5 BENEFITS</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>5.1</strong> Subject to clauses 5.2 and 5.3 below, you shall be entitled to participate in the Company's UK private medical expenses insurance scheme, this is a benefit in kind and as such will be taxable.</p>
                <p><strong>5.2</strong> If a scheme provider refuses to provide any benefit to you, whether based on its own interpretation of the terms and/or rules of the relevant scheme or otherwise, then we shall not be liable to provide you with any replacement benefit whatsoever or pay any compensation in lieu of such benefit.</p>
                <p><strong>5.3</strong> We, at our absolute discretion, reserve the right to discontinue, vary or amend the scheme (including the provider and/or level of cover provided) at any time.</p>
              </div>
            </div>

            {/* Section 6 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">6 PLACE OF WORK AND WORKING HOURS</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>6.1</strong> Your place of work will be your home, our office, a co-working space or such other locations as may be required by the Company from time to time and you shall undertake such national or international travel as may be necessary for the proper performance of your duties.</p>
                <p><strong>6.2</strong> Your working hours will be from 9:00 am to 6:00 pm from Monday to Friday (inclusive).</p>
                <p><strong>6.3</strong> Occasionally, such as before important business events and deadlines, we may need "all hands on deck" and we may ask you to work additional hours to help us hit our goals. It's important to note that rather than counting hours that people are working, we're focused on creating great things that happen on time, and that we're looking to create a team of people who understand this and who are happy to put the time in - when needed - to hit those goals.</p>
                <p><strong>6.4</strong> Regulation 4(1) of the Working Time Regulations 1998 ("WTR") provides that your average working time, including overtime, should not exceed 48 hours for each seven day period (to be averaged over a period of 17 weeks) unless you agree otherwise. In accordance with Regulation 5 of the WTR you agree that Regulation 4(1) of the WTR will not apply to your employment with the Company. You may at any time give one months' written notice to us to withdraw your agreement to this.</p>
              </div>
            </div>

            {/* Section 7 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">7 RESPONSIBILITIES</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>7.1</strong> During your employment with us you agree to:</p>
                <div className="ml-6">
                  <p>(a) carry out such duties as may be required by us from time to time;</p>
                  <p>(b) comply with our rules, policies and procedures in force from time to time;</p>
                  <p>(c) spend the whole of your time, attention and ability during working hours (and any "all hands on deck" time) to carrying out your duties with due care and attention; and</p>
                  <p>(d) well and faithfully serve the Company to the best of your ability and use your best endeavours to promote the interests of the Company.</p>
                </div>
                <p><strong>7.2</strong> So as not to cause any conflict between your employment and your outside interests, you agree not without the prior written consent of the Company (such consent not to be unreasonably withheld) to be directly or indirectly engaged or concerned in any other public or private work (whether for profit or otherwise) other than your duties for the Company. Notwithstanding this, you may, without needing consent, hold an investment by way of shares or other securities of up to 5% of the share capital of any company where such company does not carry on a business similar to or competitive with any business for the time being carried on by the Company.</p>
              </div>
            </div>

            {/* Section 8 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">8 HOLIDAYS</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>8.1</strong> You are entitled to 25 days paid holiday during each holiday year (or the pro rata equivalent if you work part time), in addition to the public holidays in England and Wales.</p>
                <p><strong>8.2</strong> The Natter holiday year begins on 1 January. If your employment starts or finishes part way through the holiday year, your holiday entitlement during that year will be calculated on a pro-rata basis rounded up to the nearest day.</p>
                <p><strong>8.3</strong> Holiday days may only be taken at times mutually agreed in advance with your manager. We encourage you to take your holiday at regular intervals in the holiday year. If, for whatever reason, you don't manage to take all your holiday in the applicable holiday year, you may carry over 3 days into the subsequent holiday year, which must be used within the first calendar month of that year.</p>
                <p><strong>8.4</strong> No payment in lieu will be made for holiday days not taken, except on the termination of your employment, when you will be paid in lieu of holiday not taken but accrued in the holiday year. The amount of the payment in lieu will be 1/260th of your full time equivalent salary for each accrued holiday day.</p>
                <p><strong>8.5</strong> If on termination of the employment you have taken more holiday than your accrued holiday entitlement, we will be entitled to deduct the excess holiday pay from any payments due to you, calculated at 1/260th of your salary for each excess day.</p>
              </div>
            </div>

            {/* Section 9 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">9 PENSION</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p>The Company confirms to you that it will comply with the employer pension duties under Part 1 of the Pensions Act 2008.</p>
              </div>
            </div>

            {/* Section 10 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">10 SICKNESS OR OTHER ABSENCE</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>10.1</strong> If you are ill or unable to come to work for any reason, you should contact your manager as early as possible on the first day of any absence with an estimate of how long you will be away. If you cannot notify your manager yourself you should arrange for someone else to do so for you.</p>
                <p><strong>10.2</strong> If you are absent from work for more than seven calendar days, you must provide a medical certificate. Subject to you satisfying the relevant requirements you may be eligible for Statutory Sick Pay ("SSP"). Other than SSP, you will be entitled only to such remuneration if any as the Company may approve in its discretion (which will be inclusive of SSP).</p>
                <p><strong>10.3</strong> We may also require a medical certificate from your doctor and/or a doctor we choose, confirming that you are fit to return to work after any period of absence. You agree that any verbal or written report produced in connection with a doctor seeing you on our behalf may, with your consent, be disclosed to the Company.</p>
              </div>
            </div>

            {/* Section 11 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">11 INTELLECTUAL PROPERTY</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p>"Intellectual Property Rights" means copyright, moral rights, patent rights, trade marks, trade names, goodwill and the right to sue for passing off, design right, rights in or to databases, rights in or relating to confidential information, rights in relation to domain names and all other industrial, commercial or intellectual property rights (whether registered or unregistered) throughout the world and all similar or equivalent rights or forms of protection which exist now or may exist in the future.</p>
                <p>"Created Works" means any and all physical and digital materials produced by or on behalf of you for the Company (including any materials created in anticipation of the Company being founded, all materials created in the course of your employment by the Company and any materials you have created jointly with others) and however generated or stored including but not limited to documents, inventions, discoveries, improvements, innovations, reports, research, artwork, business and/or financial plans, pitches, correspondence, designs, specifications, databases, architecture diagrams, interface design and software, including source code, whether or not patentable or capable of registration, and whether or not recorded in any medium.</p>
                <p><strong>11.1</strong> You will give the Company full written details of all Created Works and of all works embodying Intellectual Property Rights made wholly or partially by you at any time during your employment which relate to, or are reasonably capable of being used in, the business of the Company.</p>
                <p><strong>11.2</strong> You agree that all Created Works created by you in the course of your employment will be original and will not be wholly or substantially copied from any third party works.</p>
                <p><strong>11.3</strong> You acknowledge that all Intellectual Property Rights subsisting (or which may in the future subsist) in all such Created Works will by law automatically, on creation, vest in the Company absolutely. To the extent that they do not vest automatically by law, you hold them on trust for the Company. You agree promptly to execute all documents and do all acts as may, in the opinion of the Company, be necessary to give effect to this clause 11.</p>
                <p><strong>11.4</strong> You hereby irrevocably waive all moral rights, whether under the Copyright, Designs and Patents Act 1988 (and all similar rights in other jurisdictions) or otherwise, which you have or will have in any existing or future Created Works.</p>
                <p><strong>11.5</strong> You will not register or attempt to register any of the Intellectual Property Rights in the Created Works, unless requested to do so in writing by a director of the Company.</p>
                <p><strong>11.6</strong> You agree at the Company's cost to do all things which are necessary or desirable for the Company to obtain for itself or its nominees the full benefit of this assignment.</p>
              </div>
            </div>

            {/* Section 12 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">12 CONFIDENTIAL INFORMATION</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p>"Confidential Information" means all information of a confidential nature including trade secrets and commercially sensitive information including, but not limited to, information which is not in the public domain about the Company or the Company's clients, information about suppliers, contacts, targets, providers and introducers of work, the Company's systems, practices, procedures, information relating to the Company's terms of business, personal data about founders, directors, employees and contractors, all information contained in paper format or stored in software programs or otherwise on computers used by the Company (whatever format and wherever located) and information of a confidential nature of any third party to which you have access to in the course of performing your employment duties.</p>
                <p><strong>12.1</strong> You acknowledge that in the course of your duties you will have access to Confidential Information. You have therefore agreed to accept the obligations in this clause 12.</p>
                <p><strong>12.2</strong> You will not (except in the proper course of your duties), either during your employment or at any time after its termination (however arising) use or disclose to any person whatsoever (and will use your best endeavours to prevent the publication or disclosure of) any Confidential Information. This will not apply to:</p>
                <div className="ml-6">
                  <p>(a) any use or disclosure authorised by the board of directors of the Company or required by law;</p>
                  <p>(b) any information which is already in, or comes into, the public domain other than through your unauthorised disclosure; or</p>
                  <p>(c) any protected disclosure within the meaning of section 43A of the Employment Rights Act 1996 (whistleblowing) (as amended, updated or replaced from time to time).</p>
                </div>
                <p><strong>12.3</strong> The restrictions contained in this clause 12 will also apply after the Termination Date.</p>
                <p><strong>12.4</strong> All notes, memoranda, samples and other documents and materials (in whatever form including, without limitation, in written, oral, visual or electronic form or on any magnetic or optical disk or memory and wherever located) containing Confidential Information or otherwise relating to the business of the Company (whether created or acquired by you or otherwise) will be the property of the Company and surrendered by you to the Company (or irretrievably deleted by you where incapable of surrender) at the request of the Company at any time during the course of your employment.</p>
              </div>
            </div>

            {/* Section 13 - abbreviated for length */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">13 DATA PROTECTION</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>13.1</strong> Unless the context otherwise requires, the terms "Personal Data" and "Special Category Personal Data" will have the meanings given to them in the United Kingdom General Data Protection Regulation, the Data Protection Act 2018 and any similar, analogous or replacement legislation.</p>
                <p><strong>13.2</strong> Personal Data and Special Category Personal Data relating to you (including sensitive personal data such as medical details and details of gender, race and ethnic origin) may, to the extent that it is reasonably necessary, in connection with your employment or the business of the Company be collected, stored, processed, disclosed or transferred as set out in the Company's privacy policy.</p>
              </div>
            </div>

            {/* Section 14 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">14 OUR PROPERTY</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>14.1</strong> All equipment and materials provided for your use by Natter, and any materials (including copies) produced, maintained or stored on Natter's premises or computer systems or other electronic equipment or services (including mobile phones or cloud services), remain the property of the Company ("Natter Property").</p>
                <p><strong>14.2</strong> All Natter Property in your possession or control including (without limitation) all credit, charge and expense cards, books, notes, memoranda, correspondence, tapes, codes, keys, papers, drawings, designs, documents, records, computer discs, computer hardware, computer software, mobile telephones, confidential information, trade secrets or intellectual property remain the property of the Company. You shall deliver all such items in your possession, custody or control immediately to the Company on the Termination Date, or earlier if requested by the Company.</p>
                <p><strong>14.3</strong> Upon termination of your employment you will irretrievably delete any Natter Property stored on any magnetic or optical disk or memory, and all matter derived from such sources which is in your possession or control outside the premises or computer systems of Natter.</p>
                <p><strong>14.4</strong> If requested by the Company, you will provide a signed statement that you have complied fully with your obligations under this clause 14.</p>
              </div>
            </div>

            {/* Section 15 - abbreviated */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">15 PROTECTION OF OUR INTERESTS</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>15.1</strong> For the purposes of this clause, definitions for "Counterparty", "Prospective Counterparty", "Restricted Business", "Restricted Person", and "Termination Date" apply as set out in the full agreement.</p>
                <p><strong>15.2</strong> You will not either personally or by an agent and either on your own account or for or in association with any other person directly or indirectly during your employment and for a period of 6 months after the Termination Date be employed or engaged or otherwise interested in any Restricted Business which is or intends to be in competition with the Company.</p>
                <p><strong>15.3</strong> You will not either personally or by an agent and either on your own account or for or in association with any other person directly or indirectly for a period of 12 months after the Termination Date solicit, canvass, or have business dealings with any Counterparty or Prospective Counterparty in competition with the Company.</p>
              </div>
            </div>

            {/* Section 16 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">16 NOTICE PERIOD AND TERMINATING YOUR EMPLOYMENT</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>16.1</strong> The first 26 weeks of your employment will be a probationary period and your employment may be terminated during this period at any time on one week's prior notice. During this probationary period your performance and suitability for continued employment will be monitored.</p>
                <p><strong>16.2</strong> After you have passed your probationary period, either you or the Company can terminate your employment by giving four weeks notice in writing. After you've been employed for two years your statutory notice entitlement will increase by one week for each complete year of continuous employment up to a maximum of 12 weeks' notice.</p>
                <p><strong>16.3</strong> We may at our absolute discretion elect to terminate your employment with immediate effect and pay you in lieu of any unexpired period of notice of termination.</p>
                <p><strong>16.4</strong> We will be entitled to dismiss you at any time without notice or payment in lieu of notice if you commit a serious breach of your obligations as an employee.</p>
              </div>
            </div>

            {/* Section 17 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">17 GARDEN LEAVE</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>17.1</strong> Following any notice of termination, whether by you or by the Company and until the end of the notice period, the Company may direct, in its sole and exclusive discretion, that you should not perform any further duties and exercise no powers or authorities in connection with your employment ("Garden Leave").</p>
                <p><strong>17.2</strong> During Garden Leave, you will remain an employee of the Company and be bound by the terms of this Agreement.</p>
                <p><strong>17.3</strong> The periods for which the restrictions in clause 15 apply will be reduced by any period that you have been excluded pursuant to this clause 17.</p>
              </div>
            </div>

            {/* Section 18 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">18 DISCIPLINARY AND GRIEVANCE</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>18.1</strong> Your attention is drawn to the disciplinary and grievance procedures applicable to your employment, which will be provided as part of your onboarding. These procedures do not form part of your contract of employment.</p>
                <p><strong>18.2</strong> If you wish to appeal against a disciplinary decision you may apply in writing to our CEO in accordance with our disciplinary procedure.</p>
                <p><strong>18.3</strong> We reserve the right to suspend you with pay for no longer than is necessary to investigate any allegation of misconduct against you.</p>
                <p><strong>18.4</strong> If you wish to raise a grievance you may apply in writing to our CEO in accordance with our grievance procedure.</p>
              </div>
            </div>

            {/* Section 19 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">19 ENTIRE AGREEMENT</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>19.1</strong> This Agreement contains the entire agreement between the parties and supersedes and extinguishes all previous drafts, agreements, arrangements and understandings between them, whether written or oral, relating to your continued employment.</p>
                <p><strong>19.2</strong> Each party acknowledges that in entering into this Agreement it does not rely on, and will have no remedy in respect of, any statement, representation, undertaking or warranty (whether made innocently or negligently) whether written or oral, save as is expressly set out in this Agreement.</p>
              </div>
            </div>

            {/* Section 20 */}
            <div className="section mb-6">
              <h2 className="text-lg font-bold mb-3">20 GENERAL</h2>
              <div className="ml-6 space-y-2 text-sm">
                <p><strong>20.1</strong> The interpretation of general words will not be restricted by words indicating a particular class or particular examples.</p>
                <p><strong>20.2</strong> There is no collective agreement which directly affects your employment.</p>
                <p><strong>20.3</strong> We reserve the right to make reasonable changes to any of your terms of employment. You will be notified in writing of any change as soon as possible and in any event within one month of the change.</p>
                <p><strong>20.16</strong> The validity, construction and performance of this Agreement will be governed by and construed in accordance with the laws of England and Wales and each of you and the Company irrevocably agree to submit to the exclusive jurisdiction of the courts of England and Wales.</p>
              </div>
            </div>

            {/* Signature Block */}
            <div className="mt-12 pt-8 border-t border-gray-300">
              <p className="mb-8">Yours sincerely,</p>
              
              <div className="mb-8">
                <p className="mb-4">_______________________________</p>
                <p className="font-semibold">For and on behalf of Tenth Chapter Limited</p>
              </div>

              <div className="mt-12">
                <p className="mb-2">I confirm my acceptance of the terms set out above and my agreement to be bound by them.</p>
                
                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div>
                    <p className="mb-4">_______________________________</p>
                    <p>Nigel Bautista</p>
                  </div>
                  <div>
                    <p className="mb-4">_______________________________</p>
                    <p>Date</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
