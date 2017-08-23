require 'csv'

csv_files = Dir["logs/logfile-*.csv"]

def change_quotations(csv_files)
  for f in csv_files
    `sed 's/,"/,|/' #{f} > #{f}.process`
    `sed 's/",/|,/' #{f}.process > #{f}`
    `rm logs/*.process`
  end
end

change_quotations(csv_files)

for f in csv_files
  rows = []
  CSV.foreach(f, quote_char: '|') do |row|
    row[0] = Time.at(row[0].to_i/1000)
    rows << row
  end

  CSV.open("#{f.sub('logfile-','')}", "wb", quote_char: '|') do |csv|
    rows.each {|r| csv << r }
  end
end
