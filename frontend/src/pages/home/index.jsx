import MainHeader from '../../components/menu/MainHeader';
import Banner from '../../components/home/Banner';
import './home.scss';

const HomePage = () => {
  return (
    <div className='full-container relative'>
      <div className='app-space-group'>
        <img className='space opacity-60' src='/images/banner/space.png' alt='' />
      </div>
      <div className='home h-full'>
        <MainHeader />
        <div id='section1' className='h-full overflow-auto'>
          <Banner />
        </div>
      </div>
    </div>
  );
}

export default HomePage;
