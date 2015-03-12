class AddRadarChartToNotes < ActiveRecord::Migration
  def change
    add_column :notes, :radarchart_file_name, :string
  end
end
