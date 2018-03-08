"use strict";

//引入模块
const https = require('https');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// 爬虫的 URL 信息
const sourceUrl = {
	hostname: 'movie.douban.com',
	path: '/top250',
	port: '443'
};

// 创建 http get 请求
https.get(sourceUrl,res => {
	
	//保存抓取的 HTML 源码
	let htmlCode = '';
	
	// 保存 HTML 源码解析出来的电影信息
	let movies = [];
	
	let saveData = (movies) => {
		
		if(!movies.length) return;
		
		fs.writeFile('data/movies.json',JSON.stringify(movies,null,4),(err)=>{
			
			if(err) return console.log(err);
			
			console.log('data saved');
		});
		
		movies.map((movie) => {
			console.log(movie.imgUrl);
			https.get(movie.imgUrl, res => {
				
				if(!res) return;
				
				let data = '';
				res.setEncoding('binary');
				res.on('data', chunk => data+=chunk );
				res.on('end', err => {
					fs.writeFile('img/'+ path.basename(movie.imgUrl), data, 'binary', err => {
						
						if(err) return console.log(err);
						
						console.log('image saved .');
					});
				
				});
			})
			
		});
		
	};
	
	res.setEncoding('utf-8');
	
	res.on('data', chunk => htmlCode += chunk );
	
	res.on('end', () => {
		let $ = cheerio.load(htmlCode);
		
		$('.item').each((index,item) => {
			 let movie = {
				 title: $('.title', item).text(),
				 star: $('.rating_num', item).text(),
				 imgUrl: $('img', item).attr('src')
			 };
				movies.push(movie);
			 
		 });
		saveData(movies);
	});
	
	res.on('error',(err) => console.log(err));
	
});