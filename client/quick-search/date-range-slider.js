import {app} from '../app-client.js';

const TP = Template.date_range_slider;

TP.onCreated(function(){
  console.log('onCreated this.data.date_range:',this.data.date_range);
});


TP.onRendered(function(){
  const tp = this;
  const slider = this.find('#slider');
  console.log('slider:',slider);
  const mySlider = noUiSlider.create(slider, {
    start: [-50, 2017],
	  range: {
      'min': [  -50 ],
		  '30%': [  1800 ],
      '70%': [ 1960],
		  'max': [ 2017 ]
	  },
    connect: true,
    tooltips: true,
    step: 1,
//    padding: 10,
    format: wNumb({
  		decimals: 0
  	})
  });
  //values, handleNumber, unencoded, tap, positions
  mySlider.on('update',function( values, handle ){
  //       doSomething($(this), values);
//    console.log('onUpdate this:',$(this));
//    console.log('onUpdate handle:',handle);
//    console.log('onUpdate values:',values); // array [0,1]
    let sub_panel = $('div.subIndex-panel');
//    console.log('sub_panel:',sub_panel);
    let year_from = values[0];
    let year_to = values[1];
    app.date_range.set('year-from',values[0]);
    app.date_range.set('year-to',values[1]);
    // nodisplay for out of range
    let entries = $('.entry',sub_panel);
//    console.log('entries:',entries.length);
    entries.each((j,e)=>{
//      console.log(`--${j} year:${$(e).attr('year')} =>${e}`);
      let year = $(e).attr('year');
      if (year < year_from) {
        $(e).hide();
      } else if (year > year_to) {
        $(e).hide();
      } else {
        $(e).show();
      }
    })
  });

  var handle_lower = slider.querySelector('.noUi-handle-lower');
  var handle_upper = slider.querySelector('.noUi-handle-upper');

  handle_lower.setAttribute('tabindex', 0);
  handle_upper.setAttribute('tabindex', 1);

  handle_lower.addEventListener('click', function(){
  	this.focus();
  });
  handle_upper.addEventListener('click', function(){
  	this.focus();
  });

  handle_lower.addEventListener('keydown', function( e ) {
//    console.log('keydown slider:',mySlider.get());
//    console.log('keydown $(slider):',$(slider));
//  	var value = Number( slider.noUiSlider.get() );
    var value = parseInt( mySlider.get()[0] );
    console.log('keydown actual:', value);

  	switch ( e.which ) {
  		case 37: //slider.noUiSlider.set( value - 10 );
//        mySlider.set(0,value-10);
        mySlider.set([value - 10, null]);
//        mySlider.set([1830,1964]);
        e.preventDefault();
  			break;
  		case 39: //slider.noUiSlider.set( value + 10 );
//        mySlider.set(0,value+10);
        mySlider.set([value + 10, null]);
        e.preventDefault();
  			break;
  	}
  });

  handle_upper.addEventListener('keydown', function( e ) {
    var value = parseInt( mySlider.get()[1] );
  	switch ( e.which ) {
  		case 37:
        mySlider.set([null,value - 10]);
        e.preventDefault();
  			break;
  		case 39:
        mySlider.set([null, value + 10]);
        e.preventDefault();
  			break;
  	}
  });



/*
<script>
var handle = slider.querySelector('.noUi-handle');

handle.setAttribute('tabindex', 0);

handle.addEventListener('click', function(){
	this.focus();
});

handle.addEventListener('keydown', function( e ) {

	var value = Number( slider.noUiSlider.get() );

	switch ( e.which ) {
		case 37: slider.noUiSlider.set( value - 10 );
			break;
		case 39: slider.noUiSlider.set( value + 10 );
			break;
	}
});
</script>
  */
});
