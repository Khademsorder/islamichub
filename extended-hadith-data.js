const extendedHadithData = {
  'hadith_topics': [
    // ========== ইবাদত বিভাগ (Ibadah Category) ==========
    {
      'id': 'iman',
      'name': 'ঈমান',
      'arabic': 'الإيمان',
      'description': 'ঈমান সম্পর্কিত হাদিস',
      'category': 'ibadah',
      'subcategory': 'aqeedah',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'الإيمان بضع وستون شعبة',
          'bangla': 'ঈমানের ষাটের অধিক শাখা রয়েছে, সর্বোত্তম হলো লা ইলাহা ইল্লাল্লাহ বলা',
          'reference': 'সহিহ বুখারী ৯',
          'explanation': 'ঈমানের ৭০ এর অধিক শাখা রয়েছে। সর্বোচ্চ শাখা হলো লা ইলাহা ইল্লাল্লাহ আর সর্বনিম্ন শাখা হলো পথ থেকে কষ্টদায়ক বস্তু সরানো। লজ্জা ঈমানের অংশ।',
          'grade': 'সহিহ'
        },
        {
          'id': 2,
          'arabic': 'من قال لا إله إلا الله دخل الجنة',
          'bangla': 'যে ব্যক্তি আন্তরিকভাবে লা ইলাহা ইল্লাল্লাহ বলবে, সে জান্নাতে প্রবেশ করবে',
          'reference': 'সহিহ মুসলিম ৯৪',
          'explanation': 'এখানে শর্ত হলো আন্তরিকতা। শুধু মুখে বললেই হবে না, অন্তর থেকে বিশ্বাস করতে হবে।',
          'grade': 'সহিহ'
        },
        {
          'id': 3,
          'arabic': 'لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه',
          'bangla': 'তোমাদের কেউ মুমিন হতে পারবে না যতক্ষণ না সে তার ভাইয়ের জন্য তাই পছন্দ করবে যা নিজের জন্য পছন্দ করে',
          'reference': 'সহিহ বুখারী ১৩',
          'explanation': 'ঈমানের একটি গুরুত্বপূর্ণ শর্ত হলো অন্যের প্রতি সদিচ্ছা পোষণ করা।',
          'grade': 'সহিহ'
        }
      ]
    },
    {
      'id': 'salah',
      'name': 'নামাজ',
      'arabic': 'الصلاة',
      'description': 'নামাজ সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'الصلاة عماد الدين',
          'bangla': 'নামাজ হলো দ্বীনের খুঁটি',
          'reference': 'মুসনাদে আহমাদ ২৬৮৬৩',
          'explanation': 'নামাজ ইসলামের ভিত্তি, নামাজ ছাড়লে দ্বীন ধ্বংস হয়',
          'audio': 'assets/audio/salah_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'بين العبد وبين الكفر ترك الصلاة',
          'bangla': 'বান্দা ও কুফরের মাঝে নামাজ ত্যাগ করা',
          'reference': 'সহিহ মুসলিম ১১৬',
          'explanation': 'নামাজ ত্যাগ করা কুফরীর কাজ',
          'audio': 'assets/audio/salah_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'zakat',
      'name': 'যাকাত',
      'arabic': 'الزكاة',
      'description': 'যাকাত সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'الزكاة تطفئ الخطيئة كما يطفئ الماء النار',
          'bangla': 'যাকাত গুনাহ দূর করে, যেমন পানি আগুন নিভিয়ে দেয়',
          'reference': 'তিরমিজি ৬২৬',
          'explanation': 'যাকাত দিলে গুনাহ মাফ হয়',
          'audio': 'assets/audio/zakat_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'ما نقص مال من صدقة',
          'bangla': 'সদকা দিলে সম্পদ কমে না',
          'reference': 'সহিহ মুসলিম ২৩৪১',
          'explanation': 'আল্লাহ সদকার বিনিময়ে সম্পদ বাড়িয়ে দেন',
          'audio': 'assets/audio/zakat_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'sawm',
      'name': 'রোজা',
      'arabic': 'الصوم',
      'description': 'রোজা সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'الصيام جنة من النار',
          'bangla': 'রোজা জাহান্নাম থেকে আড়াল',
          'reference': 'সহিহ বুখারী ২৮৫৫',
          'explanation': 'রোজাদার জাহান্নামের আগুন থেকে রক্ষা পায়',
          'audio': 'assets/audio/sawm_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'من صام رمضان إيمانا واحتسابا غفر له ما تقدم من ذنبه',
          'bangla': 'যে ঈমানের সাথে রমজানের রোজা পালন করবে, তার অতীতের গুনাহ মাফ হয়',
          'reference': 'সহিহ বুখারী ৩৮',
          'explanation': 'রমজানের রোজা ঈমানের সাথে পালন করলে সব গুনাহ মাফ হয়',
          'audio': 'assets/audio/sawm_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'hajj',
      'name': 'হজ্জ',
      'arabic': 'الحج',
      'description': 'হজ্জ সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'العمرة إلى العمرة كفارة لما بينهما',
          'bangla': 'এক উমরাহ থেকে অপর উমরাহ পর্যন্ত কাফফারা',
          'reference': 'সহিহ বুখারী ১৭৭৩',
          'explanation': 'দুই উমরাহর মাঝের গুনাহ মাফ হয়',
          'audio': 'assets/audio/hajj_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'الحج المبرور ليس له جزاء إلا الجنة',
          'bangla': 'কবুল হওয়া হজ্জের প্রতিদান শুধু জান্নাত',
          'reference': 'সহিহ বুখারী ১৭৭১',
          'explanation': 'সঠিকভাবে হজ্জ পালনকারীর প্রতিদান জান্নাত',
          'audio': 'assets/audio/hajj_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'akhlak',
      'name': 'আখলাক',
      'arabic': 'الأخلاق',
      'description': 'চরিত্র সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'إنما بعثت لأتمم مكارم الأخلاق',
          'bangla': 'আমি উত্তম চরিত্র পূর্ণ করার জন্য প্রেরিত হয়েছি',
          'reference': 'সহিহ বুখারী ৩৫৯৪',
          'explanation': 'রাসূল (সা.)-এর মূল উদ্দেশ্য ছিল মানুষের চরিত্র উন্নয়ন',
          'audio': 'assets/audio/akhlak_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'المؤمن الذي يخالط الناس ويصبر على أذاهم خير من الذي لا يخالط الناس',
          'bangla': 'মানুষের সাথে মেশাকরে তাদের ক্ষতি সহ্য করে এমন মুমিন অপেক্ষা যে মানুষের সাথে মেশে না সে উত্তম',
          'reference': 'সহিহ বুখারী ৬৭৮৭',
          'explanation': 'সমাজে মিশে থেকে ক্ষতি সহ্য করা উত্তম গুণ',
          'audio': 'assets/audio/akhlak_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'parents',
      'name': 'পিতা-মাতা',
      'arabic': 'الوالدين',
      'description': 'পিতা-মাতার হক সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'رضا الرب في رضا الوالدين',
          'bangla': 'আল্লাহর সন্তুষ্টি পিতা-মাতার সন্তুষ্টিতে',
          'reference': 'তিরমিজি ১৯৯৯',
          'explanation': 'পিতা-মাতাকে খুশি করলে আল্লাহ খুশি হন',
          'audio': 'assets/audio/parents_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'بر الوالدين أفضل من الصلاة والصوم والجهاد',
          'bangla': 'পিতা-মাতার সেবা নামাজ, রোজা ও জিহাদ অপেক্ষা উত্তম',
          'reference': 'বায়হাক্বী ২০৫৪',
          'explanation': 'পিতা-মাতার সেবা ইবাদতের চেয়েও উত্তম',
          'audio': 'assets/audio/parents_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'honesty',
      'name': 'সততা',
      'arabic': 'الأمانة',
      'description': 'সততা ও আমানত সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'آية المنافق ثلاث إذا حدث كذب وإذا وعد أخلف وإذا اؤتمن خان',
          'bangla': 'মুনাফিকের তিনটি লক্ষণ: কথা বললে মিথ্যা বলে, ওয়াদা করলে ভঙ্গ করে, আমানত দিলে খিয়ানতি করে',
          'reference': 'সহিহ বুখারী ৩৩',
          'explanation': 'মিথ্যা, ওয়াদা ভঙ্গ ও খিয়ানতি মুনাফিকের গুণ',
          'audio': 'assets/audio/honesty_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'الصدق يهدي إلى البر',
          'bangla': 'সত্যবাদিতা ভালো কাজের দিকে পরিচালিত করে',
          'reference': 'সহিহ বুখারী ৬০৭৪',
          'explanation': 'সত্যবাদিতা জান্নাতের পথ দেখায়',
          'audio': 'assets/audio/honesty_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'patience',
      'name': 'ধৈর্য',
      'arabic': 'الصبر',
      'description': 'ধৈর্য সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'الصبر ضياء',
          'bangla': 'ধৈর্য একটি আলো',
          'reference': 'সহিহ মুসলিম ২২৩',
          'explanation': 'ধৈর্য মুমিনের জন্য আলোর মতো',
          'audio': 'assets/audio/patience_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'من يصبر يصبره الله',
          'bangla': 'যে ধৈর্য ধারণ করে, আল্লাহ তাকে ধৈর্য দান করেন',
          'reference': 'সহিহ বুখারী ৬৫০০',
          'explanation': 'ধৈর্যশীলকে আল্লাহ সাহায্য করেন',
          'audio': 'assets/audio/patience_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'knowledge',
      'name': 'জ্ঞান',
      'arabic': 'العلم',
      'description': 'জ্ঞান সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'من سلك طريقا يلتمس فيه علما سهل الله له طريقا إلى الجنة',
          'bangla': 'যে ব্যক্তি জ্ঞান অর্জনের পথ অবলম্বন করে, আল্লাহ তার জন্য জান্নাতের পথ সহজ করে দেন',
          'reference': 'সহিহ মুসলিম ২৬৯৯',
          'explanation': 'জ্ঞান অর্জন জান্নাতের পথ',
          'audio': 'assets/audio/knowledge_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'طلب العلم فريضة على كل مسلم',
          'bangla': 'প্রত্যেক মুসলিমের জন্য জ্ঞান অর্জন ফরজ',
          'reference': 'ইবনে মাজাহ ২২৪',
          'explanation': 'জ্ঞান অর্জন করা ফরজ',
          'audio': 'assets/audio/knowledge_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'sadaqah',
      'name': 'সদকা',
      'arabic': 'الصدقة',
      'description': 'সদকা ও দান সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'الصدقة تطفئ الخطيئة كما يطفئ الماء النار',
          'bangla': 'সদকা গুনাহ দূর করে, যেমন পানি আগুন নিভিয়ে দেয়',
          'reference': 'তিরমিজি ৬২৬',
          'explanation': 'সদকা গুনাহের কাফফারা',
          'audio': 'assets/audio/sadaqah_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'ما نقص مال من صدقة',
          'bangla': 'সদকা দিলে সম্পদ কমে না',
          'reference': 'সহিহ মুসলিম ২৩৪১',
          'explanation': 'আল্লাহ সদকার বিনিময়ে বরকত দেন',
          'audio': 'assets/audio/sadaqah_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'forgiveness',
      'name': 'ক্ষমা',
      'arabic': 'المغفرة',
      'description': 'ক্ষমা ও তাওবা সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'من قال أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه',
          'bangla': 'যে ব্যক্তি বলবে: আমি আল্লাহর কাছে ক্ষমা চাই, তিনি ছাড়া কোনো ইলাহ নেই',
          'reference': 'সহিহ বুখারী ৬৩৭৮',
          'explanation': 'এই দোয়া পড়লে গুনাহ মাফ হয়',
          'audio': 'assets/audio/forgiveness_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'التائب من الذنب كمن لا ذنب له',
          'bangla': 'যে গুনাহ থেকে তাওবা করে, সে যেনো গুনাহহীন ব্যক্তি',
          'reference': 'ইবনে মাজাহ ৪২৫০',
          'explanation': 'তাওবা করলে গুনাহ মাফ হয়ে যায়',
          'audio': 'assets/audio/forgiveness_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'death',
      'name': 'মৃত্যু',
      'arabic': 'الموت',
      'description': 'মৃত্যু ও পরকাল সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'أكثروا من ذكر هاذم اللذات الموت',
          'bangla': 'মৃত্যুর কথা বেশি করো',
          'reference': 'তিরমিজি ২৩০৭',
          'explanation': 'মৃত্যুর স্মরণের মাধ্যমে পার্থিব জীবনের প্রতি অনীহা কমে',
          'audio': 'assets/audio/death_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'كفى بالموت واعظا',
          'bangla': 'মৃত্যুই যথেষ্ট উপদেশ',
          'reference': 'বায়হাক্বী ১৮৮৯',
          'explanation': 'মৃত্যুর চিন্তা মানুষকে সঠিক পথে পরিচালিত করে',
          'audio': 'assets/audio/death_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'jannah',
      'name': 'জান্নাত',
      'arabic': 'الجنة',
      'description': 'জান্নাত ও জাহান্নাম সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'إن في الجنة مائة درجة',
          'bangla': 'জান্নাতে একশত স্তর রয়েছে',
          'reference': 'সহিহ বুখারী ২৮৪৩',
          'explanation': 'জান্নাতের বিভিন্ন স্তরে বিভিন্ন মর্যাদা',
          'audio': 'assets/audio/jannah_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'جنتان من فضل ذهب وآنيتان من فضل فضة',
          'bangla': 'দুটি জান্নাত স্বর্ণ ও রৌপ্য দিয়ে তৈরি',
          'reference': 'সহিহ মুসলিম ২৮৩১',
          'explanation': 'জান্নাতের অসীম সৌন্দর্য',
          'audio': 'assets/audio/jannah_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'sunnah',
      'name': 'সুন্নত',
      'arabic': 'السنة',
      'description': 'সুন্নত পালন সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'من أحيا سنتي فقد أحبني',
          'bangla': 'যে আমার সুন্নত পুনরুজ্জীবিত করবে, সে আমাকে ভালোবাসে',
          'reference': 'সহিহ বুখারী ৬৯৩৪',
          'explanation': 'সুন্নত পালন রাসূলের ভালোবাসা লাভের মাধ্যম',
          'audio': 'assets/audio/sunnah_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'ترك سنتي من ليس مني',
          'bangla': 'যে আমার সুন্নত ত্যাগ করবে, সে আমার দল ভুক্ত নয়',
          'reference': 'তিরমিজি ২৬৬৫',
          'explanation': 'সুন্নত ত্যাগ রাসূলের অনুসরণ নয়',
          'audio': 'assets/audio/sunnah_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'friendship',
      'name': 'বন্ধুত্ব',
      'arabic': 'الصداقة',
      'description': 'বন্ধুত্ব ও সম্পর্ক সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'المرء على دين خليله',
          'bangla': 'মানুষ তার বন্ধুর দ্বীনের উপর',
          'reference': 'আবু দাউদ ৪৮৩৩',
          'explanation': 'বন্ধুর প্রভাবে মানুষের চরিত্র গঠিত হয়',
          'audio': 'assets/audio/friendship_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'خير الأصحاب عند الله خيرهم لصاحبه',
          'bangla': 'আল্লাহর কাছে সেরা বন্ধু সে, যে তার বন্ধুর জন্য সেরা',
          'reference': 'তিরমিজি ২৪৯৫',
          'explanation': 'ভালো বন্ধু হওয়ার গুণাবলী',
          'audio': 'assets/audio/friendship_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'anger',
      'name': 'রাগ',
      'arabic': 'الغضب',
      'description': 'রাগ নিয়ন্ত্রণ সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'إذا غضب أحدكم فليسكت',
          'bangla': 'তোমাদের কেউ রাগান্বিত হলে চুপ থাকো',
          'reference': 'সহিহ বুখারী ৬২৮৩',
          'explanation': 'রাগের সময় চুপ থাকা উত্তম',
          'audio': 'assets/audio/anger_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'الشديد من غلب نفسه عند الغضب',
          'bangla': 'রাগের সময় নিজেকে নিয়ন্ত্রণ করলে সেই প্রকৃত শক্তিশালী',
          'reference': 'সহিহ বুখারী ৬১১৮',
          'explanation': 'রাগ নিয়ন্ত্রণ করা শক্তির প্রতীক',
          'audio': 'assets/audio/anger_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'marriage',
      'name': 'বিবাহ',
      'arabic': 'الزواج',
      'description': 'বিবাহ ও পারিবারিক জীবন সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'النكاح من سنتي',
          'bangla': 'বিবাহ আমার সুন্নত',
          'reference': 'সহিহ বুখারী ৫০৬৫',
          'explanation': 'বিবাহ করা রাসূলের সুন্নত',
          'audio': 'assets/audio/marriage_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'من تزوج فقد استكمل نصف الإيمان',
          'bangla': 'যে বিবাহ করল, সে ঈমানের অর্ধেক পূর্ণ করল',
          'reference': 'সহিহ বুখারী ৪০৬৮',
          'explanation': 'বিবাহ ঈমানের অর্ধেক',
          'audio': 'assets/audio/marriage_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'children',
      'name': 'সন্তান',
      'arabic': 'الأطفال',
      'description': 'সন্তান পালন সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'من كان له بنية فليستبأل له',
          'bangla': 'যার মেয়ে সন্তান আছে, সে যেন তার জন্য ভালো নাম রাখে',
          'reference': 'সহিহ বুখারী ৫৯৫০',
          'explanation': 'সন্তানের ভালো নাম রাখা গুরুত্বপূর্ণ',
          'audio': 'assets/audio/children_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'الولد الصالح ريحانة من ريحان الجنة',
          'bangla': 'নেক সন্তান জান্নাতের ফুলের মতো',
          'reference': 'মুসনাদে আহমাদ ২০১৯৯',
          'explanation': 'নেক সন্তান জান্নাতের সুগন্ধ',
          'audio': 'assets/audio/children_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'business',
      'name': 'ব্যবসা',
      'arabic': 'الأعمال',
      'description': 'ব্যবসা ও ব্যবসায়িকতা সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'التاجر الصدوق أمين مع النبيين والصديقين والشهداء',
          'bangla': 'সত্যবাদী ও আমানতবান ব্যবসায়ী নবী, সিদ্দিক ও শহীদদের সাথে থাকবে',
          'reference': 'তিরমিজি ১২০৯',
          'explanation': 'সত্যবাদী ব্যবসায়ীর মর্যাদা',
          'audio': 'assets/audio/business_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'من باع شيئا فليحسن عرضه',
          'bangla': 'যে কোনো কিছু বিক্রি করবে, সে যেন ভালোভাবে উপস্থাপন করে',
          'reference': 'সহিহ মুসলিম ১৮২৪',
          'explanation': 'বিক্রয়ের সময় সততা অপরিহার্য',
          'audio': 'assets/audio/business_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'health',
      'name': 'স্বাস্থ্য',
      'arabic': 'الصحة',
      'description': 'স্বাস্থ্য ও চিকিৎসা সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'المؤمن القوي خير من المؤمن الضعيف',
          'bangla': 'শক্তিশালী মুমিন দুর্বল মুমিন অপেক্ষা উত্তম',
          'reference': 'সহিহ মুসলিম ২৬৬৪',
          'explanation': 'শারীরিক শক্তি ইবাদতের জন্য উপকারী',
          'audio': 'assets/audio/health_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'البطنة تذهب فطنة الفتى',
          'bangla': 'পেট ভর্তি বুদ্ধি নষ্ট করে',
          'reference': 'সহিহ বুখারী ৫৯৩৮',
          'explanation': 'অত্যধিক খাওয়া বুদ্ধির শত্রু',
          'audio': 'assets/audio/health_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'environment',
      'name': 'পরিবেশ',
      'arabic': 'البيئة',
      'description': 'পরিবেশ ও প্রকৃতি সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'إذا قامت القيامة وفي يد أحدكم فسيلة فليغرسها',
          'bangla': 'কিয়ামতের দিন যদি তোমাদের কারোর একটি চারা থাকে, তবে তা রোপণ করো',
          'reference': 'সহিহ বুখারী ৬৬৮০',
          'explanation': 'গাছ লাগানো সওয়াবের কাজ',
          'audio': 'assets/audio/environment_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'الشجرة صدقة',
          'bangla': 'গাছ লাগানো সদকা',
          'reference': 'মুসনাদে আহমাদ ২৩৩৪',
          'explanation': 'গাছ লাগানো সদকার অন্তর্ভুক্ত',
          'audio': 'assets/audio/environment_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'time',
      'name': 'সময়',
      'arabic': 'الوقت',
      'description': 'সময়ের মূল্য সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'اغتنم خمسا قبل خمس',
          'bangla': 'পাঁচটি জিনিসের আগে পাঁচটি জিনিস কাজে লাগাও',
          'reference': 'সহিহ বুখারী ৬৪৩৮',
          'explanation': 'সময়ের মূল্য বুঝতে হবে',
          'audio': 'assets/audio/time_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'نعمتان مغبون فيهما كثير من الناس',
          'bangla': 'দুটি নেয়ামত আছে যাতে অধিক মানুষ প্রতারিত হয়',
          'reference': 'সহিহ বুখারী ৬৪৩৯',
          'explanation': 'সময় ও স্বাস্থ্য অবহেলা করা উচিত নয়',
          'audio': 'assets/audio/time_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'dreams',
      'name': 'স্বপ্ন',
      'arabic': 'الأحلام',
      'description': 'স্বপ্ন ও তার ব্যাখ্যা সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'الرؤيا الصالحة جزء من ستة وأربعين جزءا من النبوة',
          'bangla': 'ভালো স্বপ্ন নবুওয়ের ৪৬ ভাগের এক ভাগ',
          'reference': 'সহিহ বুখারী ৬৯৮৫',
          'explanation': 'ভালো স্বপ্ন নবুওয়ের অংশ',
          'audio': 'assets/audio/dreams_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'الرؤيا من الله والحلم من الشيطان',
          'bangla': 'ভালো স্বপ্ন আল্লাহর পক্ষ থেকে, খারাপ স্বপ্ন শয়তানের পক্ষ থেকে',
          'reference': 'সহিহ বুখারী ৬৯৯০',
          'explanation': 'স্বপ্নের প্রকৃতি বোঝা জরুরি',
          'audio': 'assets/audio/dreams_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'modesty',
      'name': 'লজ্জা',
      'arabic': 'الحياء',
      'description': 'লজ্জা ও সচ্ছতা সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'الحياء شعبة من الإيمان',
          'bangla': 'লজ্জা ঈমানের অংশ',
          'reference': 'সহিহ বুখারী ২৪',
          'explanation': 'লজ্জা ঈমানের অপরিহার্য অংশ',
          'audio': 'assets/audio/modesty_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'إن لكل دين خلقا وخلق الإسلام الحياء',
          'bangla': 'প্রত্যেক ধর্মের একটি চরিত্র আছে, ইসলামের চরিত্র হলো লজ্জা',
          'reference': 'সহিহ মুসলিম ২৫৯৩',
          'explanation': 'লজ্জা ইসলামের পরিচয়',
          'audio': 'assets/audio/modesty_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'gratitude',
      'name': 'কৃতজ্ঞতা',
      'arabic': 'الشكر',
      'description': 'কৃতজ্ঞতা ও শুকরিয়া সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'من لم يشكر الناس لم يشكر الله',
          'bangla': 'যে মানুষের প্রতি কৃতজ্ঞ নয়, সে আল্লাহর প্রতি কৃতজ্ঞ নয়',
          'reference': 'সহিহ বুখারী ৬০১৪',
          'explanation': 'মানুষের প্রতি কৃতজ্ঞতা আল্লাহর প্রতি কৃতজ্ঞতার শর্ত',
          'audio': 'assets/audio/gratitude_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'من شكر النعمة فقدقام بشكرها',
          'bangla': 'যে নেয়ামতের শুকরিয়া আদায় করে, সে তার শুকরিয়া আদায় করেছে',
          'reference': 'সহিহ মুসলিম ২৩৪৩',
          'explanation': 'নেয়ামতের শুকরিয়া আদায় করা ওয়াজিব',
          'audio': 'assets/audio/gratitude_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'unity',
      'name': 'ঐক্য',
      'arabic': 'الوحدة',
      'description': 'মুসলিম ঐক্য সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'المؤمن للمؤمن كالبنيان المرصوص يشد بعضه بعضا',
          'bangla': 'মুমিনদের পরস্পরের সম্পর্ক একটি দৃঢ় ভবনের মতো, যার এক অংশ অন্য অংশকে শক্ত করে',
          'reference': 'সহিহ মুসলিম ২৫৮৫',
          'explanation': 'মুসলিমদের ঐক্য ও ভ্রাতৃত্ব',
          'audio': 'assets/audio/unity_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'المسلم أخو المسلم',
          'bangla': 'মুসলিম মুসলিমের ভাই',
          'reference': 'সহিহ বুখারী ৬২২২',
          'explanation': 'মুসলিমদের মধ্যে ভ্রাতৃত্ববোধ',
          'audio': 'assets/audio/unity_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'charity',
      'name': 'দান',
      'arabic': 'الصدقة',
      'description': 'দান-খয়রাত সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'الصدقة تطفئ الخطيئة كما يطفئ الماء النار',
          'bangla': 'সদকা গুনাহ দূর করে, যেমন পানি আগুন নিভিয়ে দেয়',
          'reference': 'তিরমিজি ৬২৬',
          'explanation': 'সদকা গুনাহের কাফফারা',
          'audio': 'assets/audio/charity_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'داووا مرضاكم بالصدقة',
          'bangla': 'তোমাদের রোগের চিকিৎসা করো সদকা দিয়ে',
          'reference': 'সহিহ বুখারী ৫৭৪২',
          'explanation': 'সদকা রোগ নিরাময়ে সাহায্য করে',
          'audio': 'assets/audio/charity_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'justice',
      'name': 'ন্যায়',
      'arabic': 'العدل',
      'description': 'ন্যায় ও ইনসাফ সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'المقسطون عند الله على منابر من نور',
          'bangla': 'ন্যায়পরায়ণকারীরা আল্লাহর কাছে আলোর মিম্বরে থাকবে',
          'reference': 'সহিহ মুসলিম ১৮২৩',
          'explanation': 'ন্যায়পরায়ণকারীদের মর্যাদা',
          'audio': 'assets/audio/justice_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'اتقوا الظلم فإن الظلم ظلمات يوم القيامة',
          'bangla': 'অন্যায় থেকে বিরত থাকো, কেননা অন্যায় কিয়ামতের দিন অন্ধকার',
          'reference': 'সহিহ মুসলিম ২১৩২',
          'explanation': 'অন্যায় পরিহার করা জরুরি',
          'audio': 'assets/audio/justice_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'truth',
      'name': 'সত্য',
      'arabic': 'الحق',
      'description': 'সত্য ও সত্যবাদিতা সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'الصدق يهدي إلى البر',
          'bangla': 'সত্যবাদিতা ভালো কাজের দিকে পরিচালিত করে',
          'reference': 'সহিহ বুখারী ৬০৭৪',
          'explanation': 'সত্যবাদিতা জান্নাতের পথ',
          'audio': 'assets/audio/truth_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'عليكم بالصدق فإن الصدق يهدي إلى البر',
          'bangla': 'তোমরা সত্যবাদিতা অবলম্বন করো, কেননা সত্যবাদিতা ভালোর দিকে নিয়ে যায়',
          'reference': 'সহিহ মুসলিম ২৬০৭',
          'explanation': 'সত্যবাদিতা অবলম্বন করার গুরুত্ব',
          'audio': 'assets/audio/truth_hadith2.mp3'
        }
      ]
    },
    {
      'id': 'humility',
      'name': 'বিনয়',
      'arabic': 'التواضع',
      'description': 'বিনয় ও নম্রতা সম্পর্কিত হাদিস',
      'hadiths': [
        {
          'id': 1,
          'arabic': 'من تواضع لله رفعه',
          'bangla': 'যে আল্লাহর জন্য বিনয়ী হয়, আল্লাহ তাকে উন্নত করেন',
          'reference': 'সহিহ মুসলিম ২৬৮৯',
          'explanation': 'বিনয় উন্নতির কারণ',
          'audio': 'assets/audio/humility_hadith1.mp3'
        },
        {
          'id': 2,
          'arabic': 'ما نقصت صدقة من مال',
          'bangla': 'সদকা দিলে সম্পদ কমে না',
          'reference': 'সহিহ মুসলিম ২৩৪১',
          'explanation': 'দান করলে সম্পদ বাড়ে',
          'audio': 'assets/audio/humility_hadith2.mp3'
        }
      ]
    }
  ]
};
