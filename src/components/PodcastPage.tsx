import { Mic, Bell, Calendar, Radio } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Button } from './Button';

export function PodcastPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <GlassCard className="p-8 md:p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-2xl">
                <Mic size={64} className="text-white" strokeWidth={2} />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            Podcasts
          </h1>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full mb-6">
            <Radio size={16} className="text-yellow-600 dark:text-yellow-400 animate-pulse" />
            <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">Coming Soon</span>
          </div>

          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            We're working on bringing you amazing podcast content featuring interviews with industry leaders,
            technical deep-dives, and community discussions. Stay tuned for exciting updates!
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Mic size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold mb-1">Expert Interviews</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hear from industry pioneers
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Radio size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold mb-1">Live Sessions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Join interactive discussions
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 border border-green-100 dark:border-green-800">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg">
                <Calendar size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <h3 className="font-bold mb-1">Weekly Episodes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fresh content every week
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="gradient" className="flex items-center gap-2 px-6 py-3">
              <Bell size={18} />
              Notify Me When Available
            </Button>
            <Button variant="outline" className="px-6 py-3">
              Learn More
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Want to be featured as a guest or have topic suggestions?{' '}
              <button className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 font-semibold underline transition-colors">
                Contact us
              </button>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
