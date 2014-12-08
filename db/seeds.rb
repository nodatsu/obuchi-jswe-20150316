
# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).
#
# Examples:
#
#   cities = City.create([{ name: 'Chicago' }, { name: 'Copenhagen' }])
#   Mayor.create(name: 'Emanuel', city: cities.first)

require 'csv'

# db/csvフォルダ中のデータファイル
data_files = %w(26.csv)

data_files.each do |data_file|
  # 1行目はヘッダーなので無視
  CSV.foreach('db/csv/' + data_file, headers: :first_row) do |row|
    # ファイル名から年を抽出
    heisei_year = data_file.sub(/(.*)\.csv/, '\1')
    # X年X月をXXXX-XX-XX形式に
    row[5].match(/([0-9]+)月([0-9]+)日/)
    observed_at = sprintf("%04d-%02d-%02d", heisei_year.to_i + 1989, $1, $2)
    if row[4]
      image_file_name = "#{heisei_year}/#{row[4]}"
    else
      image_file_name = ""
    end

    Note.create(
      student_name: row[3],
      student_number: row[2],
      student_grade: row[0],
      student_class: row[1],
      event_name: "平成#{heisei_year}年度尾駁沼観察",
      title: row[9],
      body: "#{row[10]}#{row[11]}",
      image_file_name: image_file_name,
      observed_at: observed_at,
      weather: row[6],
      lat: row[7],
      lng: row[8]
    )
  end
end

mode = Mode.create({name: 'view'}) unless Mode.first.present?
