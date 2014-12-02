class NotesController < ApplicationController
  http_basic_authenticate_with name: ENV['BASIC_AUTH_USERNAME'], password: ENV['BASIC_AUTH_PASSWORD'] if Rails.env == "production"
  http_basic_authenticate_with name: 'teacher', password: 'secret' if Rails.env == "development"

  before_action :set_note, only: [:show, :edit, :update, :destroy]

  def maintenance
  end

  # GET /notes
  # GET /notes.json
  def index
    @notes = Note.all
    if @notes.present?
      @notes.each do |note|
        note.image_file_name = 'no_image.png' if note.image_file_name.length == 0
      end
      @lat_max = Note.maximum(:lat)
      @lat_min = Note.minimum(:lat)
      @lng_max = Note.maximum(:lng)
      @lng_min = Note.minimum(:lng)
    end
  end

  # GET /notes/1
  # GET /notes/1.json
  def show
    respond_to do |format|
      format.html
      format.js
      format.json
    end
  end

  # GET /notes/new
  def new
    @note = Note.new(lat: params[:lat], lng: params[:lng])
=begin
    # 初期値
    @note.student_grade = 4
    @note.student_class = 1
    @note.event_name = "平成26年度尾駮沼観察"
    @note.observed_at = "2014-10-02 11:00:00"
    @note.weather = "はれ"
=end
  end

  # GET /notes/1/edit
  def edit
    redirect_to maintenance_url unless edit_mode?
  end

  # POST /notes
  # POST /notes.json
  def create
    @note = Note.new(note_params)
    respond_to do |format|
      if @note.save
        format.html { redirect_to @note, notice: 'Note was successfully created.' }
        format.json { render :show, status: :created, location: @note }
      else
        format.html { render :new }
        format.json { render json: @note.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /notes/1
  # PATCH/PUT /notes/1.json
  def update
    respond_to do |format|
      if @note.update(note_params)
        format.html { redirect_to @note, notice: 'Note was successfully updated.' }
        format.json { render :show, status: :ok, location: @note }
      else
        format.html { render :edit }
        format.json { render json: @note.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /notes/1
  # DELETE /notes/1.json
  def destroy
    @note.destroy
    respond_to do |format|
      format.html { redirect_to notes_url, notice: 'Note was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_note
      @note = Note.find(params[:id])
      if @note.image_file_name.length == 0
        @note.image_file_name = 'no_image.png'
      end
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def note_params
      params.require(:note).permit(:student_name, :student_number, :student_grade, :student_class, :title, :body, :observed_at, :event_name, :lat, :lng, :image_file_name, :weather)
    end
end
