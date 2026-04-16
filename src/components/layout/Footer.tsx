export default function Footer() {
  return (
    <footer className="bg-gray-950 py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-10">
          <div className="max-w-xs">
            <span className="text-lg font-black text-white tracking-tight">Nudge.</span>
            <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">
              Automated invoice follow-ups that get you paid without the awkward conversations.
            </p>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:hello@nudge.so" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Nudge. All rights reserved.</p>
          <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Careers</a>
        </div>
      </div>
    </footer>
  );
}
