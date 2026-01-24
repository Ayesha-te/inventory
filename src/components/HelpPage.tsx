import React from 'react';
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  PlayCircle, 
  FileText, 
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  Search,
  Package,
  Plus,
  ShoppingCart,
  Truck
} from 'lucide-react';

const HelpPage: React.FC = () => {
  const categories = [
    {
      title: 'Getting Started',
      description: 'Learn the basics of Stockive and how to set up your first store.',
      icon: <PlayCircle className="text-blue-500" />,
      articles: ['Initial Setup Guide', 'Adding Your First Product', 'Understanding the Dashboard']
    },
    {
      title: 'Inventory Management',
      description: 'Advanced tools for tracking and managing your stock levels.',
      icon: <Package className="text-green-500" />,
      articles: ['Bulk Import with Excel', 'Setting Low Stock Alerts', 'Using the Barcode Scanner']
    },
    {
      title: 'Sales & Orders',
      description: 'How to manage multi-channel sales and order fulfillment.',
      icon: <ShoppingCart className="text-orange-500" />,
      articles: ['Processing Orders', 'Multi-Channel Integration', 'Generating Invoices']
    },
    {
      title: 'Settings & Account',
      description: 'Manage your profile, team members, and store configurations.',
      icon: <FileText className="text-purple-500" />,
      articles: ['Subscription Plans', 'User Permissions', 'API Access']
    }
  ];

  const faqs = [
    {
      question: "How do I import products from Excel?",
      answer: "Navigate to 'Add Products' and select the 'Excel Upload' tab. You can download our template, fill it with your product data, and then upload it back to the system."
    },
    {
      question: "Can I sync with my existing POS system?",
      answer: "Yes, Stockive supports various POS integrations. Go to the 'POS Sync' section to configure your specific system connection."
    },
    {
      question: "What happens when stock reaches the minimum level?",
      answer: "Stockive will automatically generate a low stock alert on your dashboard and send a notification to your registered email address."
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Header Section */}
      <div className="bg-[#020617] text-white rounded-[40px] p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-black mb-4 tracking-tight">How can we help you?</h1>
          <p className="text-slate-400 text-lg mb-8 font-medium">
            Search our documentation or browse categories below to find answers to your questions.
          </p>
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search help articles..." 
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#B7F000]/50 transition-all"
            />
          </div>
        </div>
        <HelpCircle className="absolute right-[-40px] top-[-40px] w-80 h-80 text-white/5 rotate-12" />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((cat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-[#B7F000]/10 transition-colors">
                {cat.icon}
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-slate-900 transition-colors" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{cat.title}</h3>
            <p className="text-slate-500 text-sm mb-6 font-medium leading-relaxed">{cat.description}</p>
            <div className="space-y-3">
              {cat.articles.map((article, aIdx) => (
                <button key={aIdx} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors">
                  <Book size={14} className="text-[#B7F000]" />
                  {article}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FAQs Section */}
      <div className="bg-white rounded-[40px] border border-slate-200 p-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-[#B7F000] rounded-xl">
            <MessageCircle className="text-black" size={24} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-8 bg-slate-50 rounded-3xl border border-slate-100 hover:border-[#B7F000]/30 transition-all">
              <h4 className="text-lg font-black text-slate-900 mb-3">{faq.question}</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Support CTA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-[#B7F000] rounded-[40px] p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-black text-black mb-2 tracking-tight">Still need help?</h2>
            <p className="text-black/60 font-bold">Our support team is available 24/7 to assist you with any issues.</p>
          </div>
          <button className="bg-black text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Contact Support
          </button>
        </div>
        <div className="bg-white rounded-[40px] border border-slate-200 p-10 flex flex-col items-center justify-center text-center">
          <LifeBuoy size={48} className="text-slate-900 mb-4" />
          <h3 className="font-black text-slate-900 mb-2">Live Chat</h3>
          <p className="text-slate-500 text-sm font-medium mb-6">Average response time: 2 mins</p>
          <button className="text-[#B7F000] font-black text-sm flex items-center gap-2 hover:underline">
            Start Conversation <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
