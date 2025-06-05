import React from 'react';
import ImageSlider from './ImageSlider';

const YenLibraryGallery = () => {
  // Tự động tạo danh sách ảnh từ thư mục public/images
  const imageList = [
    '480582171_1001158448738598_6687660948023265080_n.jpg',
    '480705044_1001064725414637_5216697593886285938_n.jpg',
    '480964918_1006301584890951_8113808953414477936_n.jpg',
    '480985051_1002639458590497_3641568744208128606_n.jpg',
    '481047633_1004969621690814_1787242431843809595_n.jpg',
    '481051837_1004969888357454_4749740616181374521_n.jpg',
    '481056952_1004967695024340_6348620981856229579_n.jpg',
    '481118990_1002639918590451_7077249650200885442_n.jpg',
    '481206553_1007938581393918_3018506327703666640_n.jpg',
    '481243621_1004345158419927_661739827144320663_n.jpg',
    '481260982_1007939228060520_4406674186970404725_n.jpg',
    '481269034_1007943428060100_3339579441720352168_n.jpg',
    '481271131_1004962305024879_8877922642841432268_n.jpg',
    '481273411_1007925638061879_5507953579848928191_n.jpg',
    '481276829_1006302381557538_5779380652677670929_n.jpg',
    '481284914_1007938428060600_2294618990055263657_n.jpg',
    '481293773_1004326278421815_1010733165656141046_n.jpg',
    '481302836_1007939221393854_5759834264304166070_n.jpg',
    '481454108_1004969648357478_4547486057446595842_n.jpg',
    '481539929_1010393061148470_232622456335757609_n.jpg',
    '481547909_1007938771393899_7046661954090145439_n.jpg',
    '481660244_1004345018419941_6033073539942394891_n.jpg',
    '481675365_1001064685414641_4416973244836279636_n.jpg',
    '481897213_1010160167838426_4414532351257622307_n.jpg',
    '481898728_1001064698747973_1278169331597880651_n.jpg',
    '481900604_1007939238060519_6514432771401211050_n.jpg',
    '481909521_1009431931244583_1873123061299769741_n.jpg',
    '481924513_1010380157816427_8343313778987621414_n.jpg',
    '482008881_1010392774481832_5822356883300291411_n.jpg',
    '482032411_1010380224483087_1080733457410179918_n.jpg',
    '482132781_1004969691690807_981223316524363476_n.jpg',
    '482249717_1007943468060096_3236098508110895858_n.jpg',
    '482263921_1009362847918158_8154812039294739291_n.jpg',
    '482264188_1007941254726984_8004266406542118002_n.jpg',
    '482318068_1010159951171781_1316256637425044866_n.jpg',
    '482319716_1009362484584861_3895564880263329644_n.jpg',
    '482807896_1009362874584822_1100569667646508770_n.jpg',
    '482827511_1009362904584819_1786992857924541760_n.jpg',
    'facebook cover (4).png'
  ];

  // Tạo object images với thông tin chi tiết
  const images = imageList.map((filename, index) => ({
    src: `/images/${filename}`,
    alt: `Ảnh hoạt động của Không gian đọc Yên ${index + 1}`,
    title: filename.includes('facebook') ? 'Facebook Cover - Không gian đọc Yên' : `Hoạt động tại thư viện ${index + 1}`,
    description: filename.includes('facebook') 
      ? 'Hình ảnh bìa Facebook của Không gian đọc Yên' 
      : 'Những khoảnh khắc đẹp tại Không gian đọc Yên - nơi lan tỏa tri thức và kết nối cộng đồng'
  }));

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Thư viện ảnh Không gian đọc Yên
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Khám phá những khoảnh khắc đẹp tại thư viện cộng đồng của chúng tôi, 
          nơi tri thức được lan tỏa và cộng đồng được kết nối.
        </p>
        <div className="w-24 h-1 mx-auto mt-4" style={{ backgroundColor: 'var(--primary-color)' }}></div>
      </div>
        <ImageSlider 
        images={images}
        autoPlay={true}
        autoPlayInterval={4000}
        showThumbnails={true}
        adaptiveHeight={false}
        minHeight="24rem"
      />
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          📸 {images.length} ảnh • Nhấp vào ảnh để xem toàn màn hình • Sử dụng mũi tên để điều hướng
        </p>
      </div>
    </div>
  );
};

export default YenLibraryGallery;
