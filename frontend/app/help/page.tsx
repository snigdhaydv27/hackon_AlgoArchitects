"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

// Structure for the dynamic Help content
type HelpTopic = {
  id: string;
  title: string;
  breadcrumb: string;
  disclaimer?: string;
  content: React.ReactNode;
};

const HELP_CONTENT: Record<string, HelpTopic> = {
  "purchase-protection": {
    id: "purchase-protection",
    title: "100% Purchase Protection",
    breadcrumb: "Site Features",
    disclaimer: "In the event of any discrepancy or conflict, the English version will prevail over the translation.",
    content: (
      <>
        <p className="text-[13px] mb-6 text-[#0F1111]">
          We are committed to ensure 100% Purchase Protection for customers by offering genuine products, secure payments and easy returns for items shopped on ReLoop via our automated circular economy system.
        </p>
        <div className="border-b border-[#D5D9D9] w-full mb-6"></div>
        <ul className="list-disc pl-5 mb-8 text-[13px] text-[#007185] space-y-1">
          <li><a href="#genuine" className="hover:underline hover:text-[#C45500]">Genuine Products (AI Verified)</a></li>
          <li><a href="#secure" className="hover:underline hover:text-[#C45500]">Secure Payments and Safe Ordering</a></li>
          <li><a href="#returns" className="hover:underline hover:text-[#C45500]">Easy Returns & Hyperlocal Delivery</a></li>
        </ul>
        <div className="space-y-8 text-[13px] text-[#0F1111] leading-relaxed">
          <section id="genuine">
            <h3 className="text-[18px] font-bold mb-2 flex items-center gap-2">
              Genuine Products
              <div className="inline-flex items-center justify-center bg-[#FF9900] text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
                AI GRADED
              </div>
            </h3>
            <p className="mb-2">
              Sellers are committed to sell only genuine, usable products to customers on ReLoop. All sellers listing their products are required to pass items through our <strong>AI Grading system</strong>.
            </p>
            <p>
              Every item is assessed instantly through image analysis (under 2 seconds). It evaluates the condition, lists defects, sets a price band, and generates a <strong>Product Health Card</strong> so you know exactly what you're getting without manual inspection.
            </p>
          </section>
          <section id="secure">
            <h3 className="text-[18px] font-bold mb-2">Secure Payments and Safe Ordering</h3>
            <p className="mb-2">
              ReLoop understands that you care about how information about you is used and shared. We appreciate your trust in us to do that carefully and sensibly. <strong>Your privacy is important to us, and we work to keep your information secure.</strong>
            </p>
            <p className="font-bold mb-2">How Secure Is Information I share with ReLoop?</p>
            <p className="mb-2">
              Our secure-server software encrypts all your personal information including credit or debit card number, name and address. The encryption process takes the characters you enter and converts them into bits of code that are then securely transmitted over the Internet.
            </p>
            <p>
              We reveal only the last four digits of your credit card numbers when confirming an order. Of course, we transmit the entire credit card number to the appropriate credit card company during order processing.
            </p>
          </section>
          <section id="returns">
            <h3 className="text-[18px] font-bold mb-2 flex items-center gap-2">
              Easy Returns
              <div className="inline-flex items-center justify-center bg-slate-200 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 border border-slate-300">
                EASY RETURNS
              </div>
            </h3>
            <p className="mb-2">
              Returns are easy with our online returns centre. Rather than shipping a returned item 600km back to a warehouse, our <strong>Smart Routing</strong> instantly connects verified local buyers within a 20km radius.
            </p>
            <p className="mb-4">
              You just drop the item at a secure neighborhood kirana locker, and the next buyer picks it up via a secure QR code scan. Zero logistics overhead, no strangers at your doorstep, and no haggling.
            </p>
            <p className="italic mb-2">To return a seller-fulfilled item —</p>
            <ol className="list-decimal pl-5 space-y-1 mb-4">
              <li>Go to <strong>Your Orders</strong>.</li>
              <li>Select the item you want to return.</li>
              <li>Click on Return or replace item.</li>
              <li>Our AI will assess the item condition and automatically route it to the nearest locker.</li>
              <li>Drop it off and proceed.</li>
            </ol>
          </section>
        </div>
      </>
    )
  },
  "lower-price": {
    id: "lower-price",
    title: "Tell Us About a Lower Price",
    breadcrumb: "Pricing & Feedback",
    content: (
      <>
        <p className="text-[13px] mb-6 text-[#0F1111]">
          ReLoop utilizes advanced AI to determine fair price bands for second-hand and refurbished goods based on real-time market data. If you believe our AI has priced an item too high, you can let us know.
        </p>
        <div className="border-b border-[#D5D9D9] w-full mb-6"></div>
        <div className="space-y-6 text-[13px] text-[#0F1111] leading-relaxed">
          <section>
            <h3 className="text-[18px] font-bold mb-2">How AI Pricing Works</h3>
            <p className="mb-2">
              When an item is returned or listed, our vision AI grades its condition (A/B/C/D). The system then correlates this condition with current market values for similar refurbished items, generating a fixed, non-negotiable price band.
            </p>
          </section>
          <section>
            <h3 className="text-[18px] font-bold mb-2">Submitting Pricing Feedback</h3>
            <p className="mb-2">
              While ReLoop does not offer direct price matching or post-purchase refunds for price drops, your feedback is crucial for training our models.
            </p>
            <ul className="list-disc pl-5 mb-4 space-y-1">
              <li>Navigate to the Product Health Card on the item's detail page.</li>
              <li>Click the "Feedback on Pricing" link.</li>
              <li>Provide a URL or reference to the lower-priced equivalent item.</li>
            </ul>
            <p className="mb-2">
              This data is sent directly to our pricing team to help monitor local market trends and improve our automated price-banding algorithms.
            </p>
          </section>
        </div>
      </>
    )
  },
  "ai-guidelines": {
    id: "ai-guidelines",
    title: "About ReLoop AI Guidelines",
    breadcrumb: "ReLoop Site Features",
    content: (
      <>
        <p className="text-[13px] mb-6 text-[#0F1111]">
          Our proprietary vision AI is the backbone of the ReLoop circular economy. It ensures speed, accuracy, and fairness in grading items.
        </p>
        <div className="border-b border-[#D5D9D9] w-full mb-6"></div>
        <div className="space-y-6 text-[13px] text-[#0F1111] leading-relaxed">
          <section>
            <h3 className="text-[18px] font-bold mb-2">The 2-Second Assessment</h3>
            <p className="mb-2">
              Sellers upload photos or short videos of the product. Within 2 seconds, our AI:
            </p>
            <ol className="list-decimal pl-5 space-y-1 mb-4">
              <li>Identifies the product model and specifications.</li>
              <li>Detects visual defects (scratches, dents, wear-and-tear).</li>
              <li>Assigns a standardized condition grade.</li>
            </ol>
          </section>
          <section>
            <h3 className="text-[18px] font-bold mb-2">Grading Criteria</h3>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li><strong>Grade A (Like New):</strong> Flawless condition, original packaging intact or lightly opened.</li>
              <li><strong>Grade B (Very Good):</strong> Minor cosmetic imperfections, fully functional.</li>
              <li><strong>Grade C (Good):</strong> Noticeable wear and tear, fully functional.</li>
              <li><strong>Grade D (Acceptable):</strong> Significant wear, functional but may require minor refurbishment.</li>
            </ul>
          </section>
        </div>
      </>
    )
  },
  "health-card": {
    id: "health-card",
    title: "Product Health Card Setup",
    breadcrumb: "Trust & Safety",
    content: (
      <>
        <p className="text-[13px] mb-6 text-[#0F1111]">
          The Product Health Card is your digital certificate of authenticity and condition for every item processed on ReLoop.
        </p>
        <div className="border-b border-[#D5D9D9] w-full mb-6"></div>
        <div className="space-y-6 text-[13px] text-[#0F1111] leading-relaxed">
          <section>
            <h3 className="text-[18px] font-bold mb-2">Immutable Trust Layer</h3>
            <p className="mb-2">
              To eliminate haggling and build trust between strangers, every item gets an immutable Health Card. This card is generated by our AI and locked into the system.
            </p>
          </section>
          <section>
            <h3 className="text-[18px] font-bold mb-2">What's on the Card?</h3>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><strong>AI Summary:</strong> Detailed list of detected defects.</li>
              <li><strong>Pricing Tier:</strong> Transparent explanation of how the price was calculated based on the grade.</li>
              <li><strong>Locker Details:</strong> The designated Kirana locker for pickup.</li>
              <li><strong>Carbon Savings:</strong> The environmental impact score for buying this item second-hand.</li>
            </ul>
          </section>
        </div>
      </>
    )
  },
  "hyperlocal-lockers": {
    id: "hyperlocal-lockers",
    title: "Hyperlocal Locker Locations",
    breadcrumb: "Logistics & Delivery",
    content: (
      <>
        <p className="text-[13px] mb-6 text-[#0F1111]">
          ReLoop's "Neighbor First" routing system connects verified local buyers and sellers within a 20km radius to eliminate shipping overhead.
        </p>
        <div className="border-b border-[#D5D9D9] w-full mb-6"></div>
        <div className="space-y-6 text-[13px] text-[#0F1111] leading-relaxed">
          <section>
            <h3 className="text-[18px] font-bold mb-2">How Secure Lockers Work</h3>
            <p className="mb-2">
              Instead of arranging meetups with strangers, sellers drop items off at partnered neighborhood Kirana stores equipped with secure ReLoop lockers.
            </p>
            <ol className="list-decimal pl-5 space-y-1 mb-4">
              <li>The seller receives a drop-off QR code and places the item in an empty locker.</li>
              <li>The buyer is notified and receives a pick-up QR code.</li>
              <li>The buyer scans their code at the locker to retrieve the item.</li>
            </ol>
            <p>This ensures 100% contactless, secure, and flexible exchanges.</p>
          </section>
          <section>
            <h3 className="text-[18px] font-bold mb-2">Finding a Locker</h3>
            <p className="mb-2">
              You can view all available lockers near your registered address via the "Nearby" map in your buyer or seller dashboard.
            </p>
          </section>
        </div>
      </>
    )
  },
  "reloop-community": {
    id: "reloop-community",
    title: "ReLoop Community Guidelines",
    breadcrumb: "Trust & Safety",
    content: (
      <>
        <p className="text-[13px] mb-6 text-[#0F1111]">
          The ReLoop Community thrives on trust, sustainability, and mutual respect within the local ecosystem.
        </p>
        <div className="border-b border-[#D5D9D9] w-full mb-6"></div>
        <div className="space-y-6 text-[13px] text-[#0F1111] leading-relaxed">
          <section>
            <h3 className="text-[18px] font-bold mb-2">Verified Buyers & Sellers</h3>
            <p className="mb-2">
              Every participant in the ReLoop network goes through a basic verification process connected to their standard Amazon account. This maintains a high standard of trust for peer-to-peer commerce.
            </p>
          </section>
          <section>
            <h3 className="text-[18px] font-bold mb-2">Zero Strangers Policy</h3>
            <p className="mb-2">
              We mandate the use of Hyperlocal Lockers for all exchanges. Never share your home address or arrange doorstep visits. The Kirana locker network is built specifically to protect your privacy and safety.
            </p>
          </section>
        </div>
      </>
    )
  },
  "recommended-for-you": {
    id: "recommended-for-you",
    title: "Recommendations & Prevention",
    breadcrumb: "Personalization",
    content: (
      <>
        <p className="text-[13px] mb-6 text-[#0F1111]">
          Our AI doesn't just grade products—it helps prevent returns before they happen.
        </p>
        <div className="border-b border-[#D5D9D9] w-full mb-6"></div>
        <div className="space-y-6 text-[13px] text-[#0F1111] leading-relaxed">
          <section>
            <h3 className="text-[18px] font-bold mb-2">Proactive Return Prevention</h3>
            <p className="mb-2">
              If an item is frequently returned due to sizing issues (e.g., "Customers with your foot profile prefer size 8 in this brand"), our AI will display a pre-purchase warning.
            </p>
            <p>
              By leveraging historical data, we guide you to the right product the first time. The best return is the one that never happens.
            </p>
          </section>
        </div>
      </>
    )
  },
  "manage-history": {
    id: "manage-history",
    title: "Manage Your Browsing History",
    breadcrumb: "Privacy & Data",
    content: (
      <>
        <p className="text-[13px] mb-6 text-[#0F1111]">
          You have full control over the data that powers your ReLoop recommendations.
        </p>
        <div className="border-b border-[#D5D9D9] w-full mb-6"></div>
        <div className="space-y-6 text-[13px] text-[#0F1111] leading-relaxed">
          <section>
            <h3 className="text-[18px] font-bold mb-2">Viewing and Deleting History</h3>
            <p className="mb-2">
              To manage the refurbished or second-hand items you've viewed on the ReLoop shop:
            </p>
            <ol className="list-decimal pl-5 space-y-1 mb-4">
              <li>Navigate to "Your Account".</li>
              <li>Select "Browsing History".</li>
              <li>Click "Remove from view" on individual items, or select "Manage history" to clear your entire cache.</li>
            </ol>
            <p>Note: Clearing your history may temporarily reduce the accuracy of your proactive return prevention warnings.</p>
          </section>
        </div>
      </>
    )
  },
  "report-issue": {
    id: "report-issue",
    title: "Report an Issue with a Product",
    breadcrumb: "Returns & Disputes",
    content: (
      <>
        <p className="text-[13px] mb-6 text-[#0F1111]">
          While our AI Grading is highly accurate, discrepancies can occasionally happen during the physical locker handoff.
        </p>
        <div className="border-b border-[#D5D9D9] w-full mb-6"></div>
        <div className="space-y-6 text-[13px] text-[#0F1111] leading-relaxed">
          <section>
            <h3 className="text-[18px] font-bold mb-2">Disputing an AI Grade</h3>
            <p className="mb-2">
              If you pick up an item from a Kirana locker and its physical condition does not match the Product Health Card:
            </p>
            <ol className="list-decimal pl-5 space-y-1 mb-4">
              <li>Do not confirm the transaction in the app.</li>
              <li>Select "Report Issue" directly from your active locker screen.</li>
              <li>Upload 2-3 clear photos of the defect.</li>
              <li>Our human review team will step in to cross-reference the original AI scan with your new photos.</li>
            </ol>
          </section>
          <section>
            <h3 className="text-[18px] font-bold mb-2">Locker Issues</h3>
            <p className="mb-2">
              If a locker is jammed or the QR code won't scan, please speak to the Kirana store owner for immediate assistance or contact our 24/7 support line through the app.
            </p>
          </section>
        </div>
      </>
    )
  }
};

export default function HelpPage() {
  const [activeTopicId, setActiveTopicId] = useState<string>("purchase-protection");

  const activeTopic = HELP_CONTENT[activeTopicId];

  return (
    <div className="bg-white text-[#0F1111] font-sans">
      <div className="mx-auto max-w-[1200px] px-4 py-8 flex flex-col md:flex-row gap-10">
        
        {/* Left Sidebar */}
        <div className="w-full md:w-56 shrink-0">
          <h3 className="text-[17px] font-bold mb-4">Help and Customer Service</h3>
          
          <div className="mb-6">
            <h4 className="text-[13px] text-[#565959] mb-1 pl-2 border-l border-[#D5D9D9] ml-1">&lt; All Help Topics</h4>
            <h4 className="text-[14px] font-bold text-[#0F1111] mt-3 mb-2">Site Features</h4>
            <ul className="space-y-2 text-[13px]">
              {Object.values(HELP_CONTENT).map((topic) => (
                <li key={topic.id}>
                  <button 
                    onClick={() => setActiveTopicId(topic.id)}
                    className={`text-left w-full hover:underline font-bold ${
                      activeTopicId === topic.id ? "text-[#0F1111]" : "text-[#007185] hover:text-[#C45500]"
                    }`}
                  >
                    {topic.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-t border-[#D5D9D9] pt-4">
            <h4 className="text-[14px] font-bold text-[#0F1111] mb-4">Quick solutions</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/seller/dashboard" className="flex gap-3 items-start group">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    <img src="https://m.media-amazon.com/images/G/31/x-locale/cs/help/images/gateway/box-swap._CB432223847_.png" alt="Orders" className="w-full h-full object-contain opacity-80" />
                  </div>
                  <div>
                    <span className="text-[13px] text-[#007185] group-hover:underline group-hover:text-[#C45500] font-bold block">Your Orders</span>
                    <span className="text-[11px] text-[#565959]">Track or cancel orders</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/seller/return/new" className="flex gap-3 items-start group">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    <img src="https://m.media-amazon.com/images/G/31/x-locale/cs/help/images/gateway/returns-box-blue._CB406180351_.png" alt="Returns" className="w-full h-full object-contain opacity-80" />
                  </div>
                  <div>
                    <span className="text-[13px] text-[#007185] group-hover:underline group-hover:text-[#C45500] font-bold block">Returns and Refunds</span>
                    <span className="text-[11px] text-[#565959]">Return or exchange items</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/shop" className="flex gap-3 items-start group">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    <img src="https://m.media-amazon.com/images/G/31/x-locale/cs/help/images/gateway/Prime_clear-bg._CB406180351_.png" alt="Prime" className="w-full h-full object-contain opacity-80" />
                  </div>
                  <div>
                    <span className="text-[13px] text-[#007185] group-hover:underline group-hover:text-[#C45500] font-bold block">Manage Green Credits</span>
                    <span className="text-[11px] text-[#565959]">Cancel or view benefits</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/login" className="flex gap-3 items-start group">
                  <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                    <img src="https://m.media-amazon.com/images/G/31/x-locale/cs/help/images/gateway/account._CB406180351_.png" alt="Account Settings" className="w-full h-full object-contain opacity-80" />
                  </div>
                  <div>
                    <span className="text-[13px] text-[#007185] group-hover:underline group-hover:text-[#C45500] font-bold block">Account Settings</span>
                    <span className="text-[11px] text-[#565959]">Update email, password or phone</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 max-w-[800px]">
          <h1 className="text-[18px] font-bold mb-2">Find more solutions</h1>
          <div className="flex mb-8 w-full max-w-xl">
            <div className="relative w-full shadow-sm rounded border border-[#888c8c] focus-within:border-[#e77600] focus-within:ring-1 focus-within:ring-[#e77600]">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#565959]">
                 <Search className="size-4" />
               </div>
               <input 
                 type="text" 
                 className="w-full pl-10 pr-3 py-1.5 text-[14px] rounded outline-none"
               />
            </div>
          </div>

          <div className="text-[13px] text-[#565959] mb-4">
            <Link href="#" className="text-[#007185] hover:underline">Help Topics</Link> &rsaquo; {activeTopic.breadcrumb}
          </div>

          <h2 className="text-[28px] text-[#0F1111] mb-4 font-normal">{activeTopic.title}</h2>
          
          {activeTopic.disclaimer && (
            <p className="text-[13px] mb-6 text-[#0F1111] font-bold">
              Disclaimer: <span className="font-normal">{activeTopic.disclaimer}</span>
            </p>
          )}

          {/* Dynamic Content Injection */}
          {activeTopic.content}

          {/* Helpful Widget */}
          <div className="mt-12 mb-12 border-t border-[#D5D9D9] pt-6 w-full">
            <div className="border border-[#D5D9D9] rounded-[8px] p-4 inline-block shadow-[0_1px_2px_rgba(0,0,0,0.05)] w-full max-w-[400px]">
              <p className="text-[14px] text-[#0F1111] mb-3 font-semibold text-center md:text-left">Was this information helpful?</p>
              <div className="flex gap-2 justify-center md:justify-start">
                <button className="bg-white hover:bg-[#F3F3F3] border border-[#D5D9D9] rounded-[8px] text-[#0F1111] px-5 py-1.5 text-[13px] shadow-[0_2px_5px_rgba(15,17,17,0.15)] focus:ring-2 focus:ring-[#008296] focus:border-transparent w-20">
                  Yes
                </button>
                <button className="bg-white hover:bg-[#F3F3F3] border border-[#D5D9D9] rounded-[8px] text-[#0F1111] px-5 py-1.5 text-[13px] shadow-[0_2px_5px_rgba(15,17,17,0.15)] focus:ring-2 focus:ring-[#008296] focus:border-transparent w-20">
                  No
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
